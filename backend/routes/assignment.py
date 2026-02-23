from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from core.response_utils import success_response, error_response
from sqlalchemy.orm import Session
from typing import List, Any, Optional
import os
import uuid
from database import get_db
from routes.auth import get_current_user
from models.quiz import TopicMastery, UserResumeData, QuizAttempt
from models.assignment import Assignment, AssignmentSubmission
from services.assignment_ai import generate_assignment, evaluate_submission
from services.learning_engine import calculate_mastery, get_topic_level
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
        return success_response(data={
            "skill_projects": [],
            "growth_projects": [],
            "capstone": "Career Execution Challenge"
        })

    # Fetch mastery records
    mastery_records = db.query(TopicMastery).filter(TopicMastery.user_id == current_user.id).all()
    mastery_map = {m.topic: m.mastery_score for m in mastery_records}

    skill_projects = resume_data.topics
    growth_projects = [t for t in resume_data.topics if mastery_map.get(t, 0) < 50]
    
    return success_response(data={
        "skill_projects": skill_projects,
        "growth_projects": growth_projects,
        "capstone": "Career Execution Challenge"
    })

@router.get("/list")
async def list_assignments(
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all assignments for the current user with their submission status."""
    assignments = db.query(Assignment).filter(Assignment.user_id == current_user.id).order_by(Assignment.id.desc()).all()
    
    result = []
    for a in assignments:
        latest_submission = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == a.id,
            AssignmentSubmission.user_id == current_user.id
        ).order_by(AssignmentSubmission.submitted_at.desc()).first()
        
        status = "pending"
        score = None
        if latest_submission:
            status = "graded" if latest_submission.score is not None else "submitted"
            score = latest_submission.score

        result.append({
            "id": a.id,
            "title": a.title,
            "topic": a.topic,
            "difficulty": a.difficulty,
            "status": status,
            "score": score,
            "created_at": a.id  # use as proxy for ordering
        })
    
    return success_response(data=result)

@router.post("/generate")
async def generate_new_assignment(
    req: AssignmentGenerateRequest,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate and save a new assignment."""
    if not req.topic or not req.topic.strip():
        return error_response("Topic is required", status_code=400)
        
    role = "Software Engineer"
    resume_data = db.query(UserResumeData).filter(UserResumeData.user_id == current_user.id).first()
    if resume_data and resume_data.role:
        role = resume_data.role

    mastery = db.query(TopicMastery).filter(
        TopicMastery.user_id == current_user.id,
        TopicMastery.topic == req.topic
    ).first()
    
    mastery_score = mastery.mastery_score if mastery else None
    level = get_topic_level(mastery_score)
    
    ai_assignment = await generate_assignment(req.topic, level, role)
    
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
    
    return success_response(data=new_assignment, message="Assignment generated")

@router.get("/{assignment_id}")
async def get_assignment(
    assignment_id: int,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a single assignment by ID with submission details."""
    assignment = db.query(Assignment).filter(
        Assignment.id == assignment_id,
        Assignment.user_id == current_user.id
    ).first()
    
    if not assignment:
        return error_response("Assignment not found", status_code=404)
    
    latest_submission = db.query(AssignmentSubmission).filter(
        AssignmentSubmission.assignment_id == assignment_id,
        AssignmentSubmission.user_id == current_user.id
    ).order_by(AssignmentSubmission.submitted_at.desc()).first()
    
    status = "pending"
    score = None
    submission_link = None
    evaluation = None
    if latest_submission:
        status = "graded" if latest_submission.score is not None else "submitted"
        score = latest_submission.score
        submission_link = latest_submission.github_link
        evaluation = latest_submission.evaluation_json

    return success_response(data={
        "id": assignment.id,
        "title": assignment.title,
        "topic": assignment.topic,
        "difficulty": assignment.difficulty,
        "instructions": assignment.instructions,
        "expected_deliverables": assignment.expected_deliverables,
        "evaluation_criteria": assignment.evaluation_criteria,
        "status": status,
        "score": score,
        "submission": submission_link,
        "evaluation": evaluation
    })

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
        return error_response("Assignment not found", status_code=404)

    file_path = None
    if file:
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            return error_response("File too large (max 5MB)", status_code=400)
        
        file_ext = os.path.splitext(file.filename)[1]
        file_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        with open(file_path, "wb") as f:
            f.write(content)

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
    latest_quiz = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id,
        QuizAttempt.topic == assignment.topic
    ).order_by(QuizAttempt.timestamp.desc()).first()
    
    quiz_score = latest_quiz.score if latest_quiz else None
    
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
    consistency_score = min(100, (recent_quizzes + recent_assignments) * 10)

    mastery = db.query(TopicMastery).filter(
        TopicMastery.user_id == current_user.id,
        TopicMastery.topic == assignment.topic
    ).first()
    
    old_score = mastery.mastery_score if mastery else None
    old_level = get_topic_level(old_score)

    new_mastery_score = calculate_mastery(quiz_score, assignment_score, consistency_score)
    new_level = get_topic_level(new_mastery_score)

    if not mastery:
        mastery = TopicMastery(
            user_id=current_user.id,
            topic=assignment.topic,
            mastery_score=new_mastery_score
        )
        db.add(mastery)
    else:
        mastery.mastery_score = new_mastery_score

    db.commit()
    db.refresh(submission)
    
    response_data = {
        "submission_id": submission.id,
        "score": assignment_score,
        "evaluation": evaluation,
        "new_mastery": mastery.mastery_score
    }
    
    if old_level != new_level and new_mastery_score > (old_score or 0):
        response_data["level_up"] = True
        response_data["topic"] = assignment.topic
        response_data["new_level"] = new_level
    
    return success_response(data=response_data, message="Assignment submitted and evaluated")
