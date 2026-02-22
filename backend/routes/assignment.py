from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Any, Optional
import os
import uuid
from database import get_db
from routes.auth import get_current_user
from models.quiz import TopicMastery, UserResumeData, QuizAttempt
from models.assignment import Assignment, AssignmentSubmission
from services.assignment_ai import generate_assignment, evaluate_submission
from pydantic import BaseModel

router = APIRouter(prefix="/api/assignment", tags=["Hybrid Assignment"])

UPLOAD_DIR = "uploads/assignments"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AssignmentGenerateRequest(BaseModel):
    topic: str

@router.get("/options")
async def get_assignment_options(
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve assignment options based on resume topics and mastery."""
    resume_data = db.query(UserResumeData).filter(UserResumeData.user_id == current_user.id).first()
    if not resume_data:
        return {
            "skill_projects": [],
            "growth_projects": [],
            "capstone": "Career Execution Challenge"
        }

    # Fetch mastery records
    mastery_records = db.query(TopicMastery).filter(TopicMastery.user_id == current_user.id).all()
    mastery_map = {m.topic: m.mastery_score for m in mastery_records}

    skill_projects = resume_data.topics
    growth_projects = [t for t in resume_data.topics if mastery_map.get(t, 0) < 50]
    
    return {
        "skill_projects": skill_projects,
        "growth_projects": growth_projects,
        "capstone": "Career Execution Challenge"
    }

@router.post("/generate")
async def generate_new_assignment(
    req: AssignmentGenerateRequest,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and save a new assignment."""
    role = "Software Engineer"
    resume_data = db.query(UserResumeData).filter(UserResumeData.user_id == current_user.id).first()
    if resume_data and resume_data.role:
        role = resume_data.role

    mastery = db.query(TopicMastery).filter(
        TopicMastery.user_id == current_user.id,
        TopicMastery.topic == req.topic
    ).first()
    
    mastery_score = mastery.mastery_score if mastery else None
    
    ai_assignment = await generate_assignment(req.topic, mastery_score, role)
    
    new_assignment = Assignment(
        user_id=current_user.id,
        title=ai_assignment["title"],
        topic=req.topic,
        type=ai_assignment["type"],
        difficulty=ai_assignment["difficulty"],
        instructions=ai_assignment["instructions"],
        expected_deliverables=ai_assignment["expected_deliverables"],
        evaluation_criteria=ai_assignment["evaluation_criteria"]
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    
    return new_assignment

@router.post("/submit")
async def submit_assignment(
    assignment_id: int = Form(...),
    code_text: Optional[str] = Form(None),
    github_link: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Handle assignment submission, trigger AI evaluation, and update mastery."""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id, Assignment.user_id == current_user.id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    file_path = None
    if file:
        # Validate file size
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")
        
        file_ext = os.path.splitext(file.filename)[1]
        file_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as f:
            f.write(content)

    # Trigger AI Evaluation
    evaluation = await evaluate_submission(
        assignment_context={
            "title": assignment.title,
            "evaluation_criteria": assignment.evaluation_criteria
        },
        submission_data={
            "code_text": code_text,
            "github_link": github_link
        }
    )

    assignment_score = evaluation.get("score", 0)

    # Create submission record
    submission = AssignmentSubmission(
        assignment_id=assignment_id,
        user_id=current_user.id,
        code_text=code_text,
        file_path=file_path,
        github_link=github_link,
        score=assignment_score,
        evaluation_json=evaluation
    )
    db.add(submission)

    # Mastery Update Logic
    # New Mastery = (Quiz Score × 0.50) + (Assignment Score × 0.30) + (Consistency × 0.20)
    
    mastery = db.query(TopicMastery).filter(
        TopicMastery.user_id == current_user.id,
        TopicMastery.topic == assignment.topic
    ).first()

    # Get latest quiz score for this topic
    latest_quiz = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.topic == assignment.topic
    ).order_by(QuizAttempt.timestamp.desc()).first()
    
    quiz_score = latest_quiz.score if latest_quiz else 0
    
    # Consistency Logic: Count of attempts in the last 7 days
    from datetime import datetime, timedelta
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_quizzes = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.timestamp >= seven_days_ago
    ).count()
    recent_assignments = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.user_id == current_user.id,
        AssignmentSubmission.submitted_at >= seven_days_ago
    ).count()
    consistency_score = min(100, (recent_quizzes + recent_assignments) * 10) # 10 points per activity, cap at 100

    if not mastery:
        # If no mastery exists yet (shouldn't happen if they generated assignment, but safe-guard)
        # Use simpler formula: mastery = assignment_score × 0.6
        mastery = TopicMastery(
            user_id=current_user.id,
            topic=assignment.topic,
            mastery_score=assignment_score * 0.6
        )
        db.add(mastery)
    else:
        if latest_quiz:
            new_mastery = (quiz_score * 0.50) + (assignment_score * 0.30) + (consistency_score * 0.20)
        else:
            # Fallback if no quiz exists: mastery = assignment_score × 0.6 (per user request)
            new_mastery = assignment_score * 0.6
        
        mastery.mastery_score = new_mastery

    db.commit()
    db.refresh(submission)
    
    return {
        "submission_id": submission.id,
        "score": assignment_score,
        "evaluation": evaluation,
        "new_mastery": mastery.mastery_score
    }
