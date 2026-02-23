from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from datetime import datetime, timedelta
from database import get_db
from routes.auth import get_current_user
from models.quiz import TopicMastery, UserResumeData, QuizAttempt
from models.assignment import AssignmentSubmission
from services.learning_engine import (
    calculate_mastery, 
    calculate_risk, 
    generate_study_plan,
    adaptive_difficulty
)
from pydantic import BaseModel

router = APIRouter(prefix="/api/learning", tags=["Learning Engine"])

@router.get("/dashboard")
async def get_learning_dashboard(
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aggregate all learning metrics for the student dashboard."""
    
    # 1. Fetch Resume Data
    resume_data = db.query(UserResumeData).filter(UserResumeData.user_id == current_user.id).first()
    resume_topics = resume_data.topics if resume_data else []
    suggested_topics = resume_data.suggested_topics if resume_data and resume_data.suggested_topics else []
    role = resume_data.role if resume_data else "Software Engineer"

    # 2. Fetch Performance Data
    mastery_records = db.query(TopicMastery).filter(TopicMastery.user_id == current_user.id).all()
    mastery_map = {m.topic: m.mastery_score for m in mastery_records}
    
    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).all()
    assignment_submissions = db.query(AssignmentSubmission).filter(AssignmentSubmission.user_id == current_user.id).all()

    is_new_user = len(quiz_attempts) == 0 and len(assignment_submissions) == 0

    # 3. Build Master Topic List
    # all_topics = unique(resume_topics + suggested_topics + quiz_topics + assignment_topics)
    all_source_topics = set(resume_topics) | set(suggested_topics)
    for q in quiz_attempts:
        all_source_topics.add(q.topic)
    # Note: assignment topics are linked to Assignment model, but usually match resume topics
    
    from models.assignment import Assignment
    assignment_topics = db.query(Assignment.topic).filter(Assignment.user_id == current_user.id).distinct().all()
    for (t,) in assignment_topics:
        all_source_topics.add(t)

    sorted_topics = sorted(list(all_source_topics))

    # 4. Consistency logic: activities in last 7 days
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_quizzes = sum(1 for q in quiz_attempts if q.timestamp >= seven_days_ago)
    recent_assignments = sum(1 for a in assignment_submissions if a.submitted_at >= seven_days_ago)
    consistency_score = min(100, (recent_quizzes + recent_assignments) * 10)

    # 5. Build Heatmap and identify High Risk
    mastery_heatmap = []
    high_risk_topics = []
    weak_topics = []

    for topic in sorted_topics:
        score = mastery_map.get(topic)
        
        if score is None:
            risk = "Not Attempted"
        else:
            risk = calculate_risk(score)
            if risk == "High Risk":
                high_risk_topics.append(topic)
                weak_topics.append(topic)
            elif score < 60:
                weak_topics.append(topic)
        
        mastery_heatmap.append({
            "topic": topic,
            "mastery": score, # will be null if not attempted
            "risk": risk
        })

    # 6. Recommendations & Study Plan
    if is_new_user:
        recommended_quiz = suggested_topics[0] if suggested_topics else (resume_topics[0] if resume_topics else "General Aptitude")
        recommended_assignment = resume_topics[0] if resume_topics else "Foundational Project"
        from services.learning_engine import generate_starter_plan
        study_plan = await generate_starter_plan(resume_topics, suggested_topics, role)
    else:
        recommended_quiz = high_risk_topics[0] if high_risk_topics else (sorted_topics[0] if sorted_topics else "")
        recommended_assignment = high_risk_topics[-1] if high_risk_topics else (sorted_topics[-1] if sorted_topics else "")
        # Filter weak topics for plan
        plan_focus = weak_topics[:3] if weak_topics else sorted_topics[:3]
        study_plan = await generate_study_plan(plan_focus, role)

    # 7. Performance Trend (Last 10 attempts)
    sorted_quizzes = sorted(quiz_attempts, key=lambda x: x.timestamp, reverse=True)[:10]
    sorted_asgn = sorted(assignment_submissions, key=lambda x: x.submitted_at, reverse=True)[:10]
    
    trend = []
    for q in sorted_quizzes:
        trend.append({"type": "Quiz", "score": q.score, "date": q.timestamp, "topic": q.topic})
    for a in sorted_asgn:
        trend.append({"type": "Assignment", "score": a.score, "date": a.submitted_at, "topic": "Project"})
    
    trend.sort(key=lambda x: x["date"])

    return {
        "is_new_user": is_new_user,
        "mastery_heatmap": mastery_heatmap,
        "high_risk_topics": high_risk_topics,
        "resume_topics": resume_topics,
        "suggested_topics": suggested_topics,
        "recommended_quiz_topic": recommended_quiz,
        "recommended_assignment_topic": recommended_assignment,
        "daily_study_plan": study_plan,
        "performance_trend": trend[-10:],
        "consistency_score": consistency_score
    }
