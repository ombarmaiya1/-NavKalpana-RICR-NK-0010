from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from database import get_db
from routes.auth import get_current_user
from models.quiz import TopicMastery, QuizAttempt, UserResumeData
from services.quiz_ai import generate_quiz
from pydantic import BaseModel

router = APIRouter(prefix="/api/quiz", tags=["Adaptive Quiz"])

class QuizGenerateRequest(BaseModel):
    topic: str

class QuizSubmitRequest(BaseModel):
    topic: str
    correct_answers: int
    total_questions: int

@router.get("/options")
async def get_quiz_options(
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve quiz options based on resume topics and mastery."""
    resume_data = db.query(UserResumeData).filter(UserResumeData.user_id == current_user.id).first()
    if not resume_data:
        # Fallback if no resume analysis done yet
        return {
            "resume_topics": [],
            "recommended_topics": [],
            "mixed_quiz_name": "Career Readiness Pulse Assessment",
            "mode": "Diagnostic Mode"
        }

    # Fetch mastery records
    mastery_records = db.query(TopicMastery).filter(TopicMastery.user_id == current_user.id).all()
    mastery_map = {m.topic: m.mastery_score for m in mastery_records}

    recommended_topics = [t for t in resume_data.topics if mastery_map.get(t, 0) < 50]
    
    return {
        "resume_topics": resume_data.topics,
        "recommended_topics": recommended_topics,
        "mixed_quiz_name": "Career Readiness Pulse Assessment",
        "mode": "Diagnostic" if not mastery_records else "Adaptive"
    }

@router.post("/generate")
async def generate_new_quiz(
    quiz_req: QuizGenerateRequest,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a quiz for a specific topic or a mixed assessment."""
    role = "Software Engineer"
    resume_data = db.query(UserResumeData).filter(UserResumeData.user_id == current_user.id).first()
    if resume_data and resume_data.role:
        role = resume_data.role

    if quiz_req.topic == "Career Readiness Pulse Assessment":
        if not resume_data:
             raise HTTPException(status_code=400, detail="Resume data required for mixed quiz.")
        
        # Get all mastery records
        mastery_records = db.query(TopicMastery).filter(TopicMastery.user_id == current_user.id).all()
        mastery_map = {m.topic: m.mastery_score for m in mastery_records}
        
        # Split topics: weak (<40), medium (40-70), strong (>70)
        # Or based on user request: 60% weak, 30% medium, 10% strong
        weak = [t for t in resume_data.topics if mastery_map.get(t, 0) < 40]
        medium = [t for t in resume_data.topics if 40 <= mastery_map.get(t, 0) <= 70]
        strong = [t for t in resume_data.topics if mastery_map.get(t, 0) > 70]
        
        # If not enough records (diagnostic mode), just use all resume topics
        if not mastery_records:
             focus_prompt = f"Diagnostic mixed quiz covering: {', '.join(resume_data.topics)}"
             mastery_score = None
        else:
             focus_prompt = (
                 f"Mixed quiz: 60% from weak topics ({', '.join(weak) or 'N/A'}), "
                 f"30% from medium topics ({', '.join(medium) or 'N/A'}), "
                 f"10% from strong topics ({', '.join(strong) or 'N/A'})"
             )
             mastery_score = 50 # Average baseline for generation scaling if mixed
        
        quiz = await generate_quiz(quiz_req.topic, mastery_score, role, difficulty="Mixed")
        return quiz

    mastery = db.query(TopicMastery).filter(
        TopicMastery.user_id == current_user.id,
        TopicMastery.topic == quiz_req.topic
    ).first()
    
    mastery_score = mastery.mastery_score if mastery else None
    quiz = await generate_quiz(quiz_req.topic, mastery_score, role)
    return quiz

@router.post("/submit")
async def submit_quiz(
    submission: QuizSubmitRequest,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Calculate score, update mastery, and record attempt."""
    score = (submission.correct_answers / submission.total_questions) * 100 if submission.total_questions > 0 else 0
    
    # Update mastery logic
    mastery = db.query(TopicMastery).filter(
        TopicMastery.user_id == current_user.id,
        TopicMastery.topic == submission.topic
    ).first()
    
    if not mastery:
        # First attempt
        mastery = TopicMastery(
            user_id=current_user.id,
            topic=submission.topic,
            mastery_score=score
        )
        db.add(mastery)
    else:
        # Mastery update formula: (old * 0.7) + (new * 0.3)
        mastery.mastery_score = (mastery.mastery_score * 0.70) + (score * 0.30)
    
    # Record attempt
    attempt = QuizAttempt(
        user_id=current_user.id,
        topic=submission.topic,
        score=score,
        total_questions=submission.total_questions,
        correct_answers=submission.correct_answers
    )
    db.add(attempt)
    db.commit()
    
    return {
        "score": round(score, 2),
        "topic_accuracy": round(score, 2),
        "new_mastery": round(mastery.mastery_score, 2)
    }
