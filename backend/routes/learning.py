from fastapi import APIRouter, Depends, HTTPException, status
from core.response_utils import success_response, error_response
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
    adaptive_difficulty,
    get_topic_level,
    fetch_internet_resources
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
    resume_topics = resume_data.topics if resume_data and resume_data.topics else []
    suggested_topics = resume_data.suggested_topics if resume_data and resume_data.suggested_topics else []
    
    # Map to schema requested
    improvement_topics = suggested_topics
    resume_strength_topics = resume_topics  # Using resume topics as strengths for now
    
    role = resume_data.role if resume_data else "Software Engineer"

    # 2. Fetch Performance Data
    mastery_records = db.query(TopicMastery).filter(TopicMastery.user_id == current_user.id).all()
    mastery_map = {m.topic: m.mastery_score for m in mastery_records}
    
    quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == current_user.id).all()
    assignment_submissions = db.query(AssignmentSubmission).filter(AssignmentSubmission.user_id == current_user.id).all()

    is_new_user = len(quiz_attempts) == 0 and len(assignment_submissions) == 0

    # 3. Build Master Topic List
    all_source_topics = set(resume_topics) | set(improvement_topics) | set(resume_strength_topics)
    for q in quiz_attempts:
        all_source_topics.add(q.topic)
    
    from models.assignment import Assignment
    assignment_topics = db.query(Assignment.topic).filter(Assignment.user_id == current_user.id).distinct().all()
    for (t,) in assignment_topics:
        all_source_topics.add(t)

    sorted_topics = sorted(list(all_source_topics))

    # 4. Consistency logic
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
        risk = calculate_risk(score)
        level = get_topic_level(score)
        
        if risk == "High Risk":
            high_risk_topics.append(topic)
            weak_topics.append(topic)
        elif score is not None and score < 60:
            weak_topics.append(topic)
        
        mastery_heatmap.append({
            "topic": topic,
            "mastery": score, # None if not attempted
            "risk": risk,
            "level": level
        })

    # 6. Default Behavior (New User) & Study Plan
    if is_new_user:
        recommended_quiz = improvement_topics[0] if improvement_topics else (resume_topics[0] if resume_topics else "General Aptitude")
        recommended_assignment = resume_topics[0] if resume_topics else "Foundational Project"
        from services.learning_engine import generate_starter_plan
        study_plan = await generate_starter_plan(resume_topics, suggested_topics, role)
        
        return success_response(data={
            "is_new_user": True,
            "mastery_heatmap": mastery_heatmap,
            "high_risk_topics": [],
            "resume_topics": resume_topics,
            "improvement_topics": improvement_topics,
            "resume_strength_topics": resume_strength_topics,
            "recommended_quiz_topic": recommended_quiz,
            "recommended_assignment_topic": recommended_assignment,
            "performance_trend": [],
            "study_plan": study_plan
        })
    else:
        recommended_quiz = high_risk_topics[0] if high_risk_topics else (sorted_topics[0] if sorted_topics else "")
        recommended_assignment = high_risk_topics[-1] if high_risk_topics else (sorted_topics[-1] if sorted_topics else "")
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

    return success_response(data={
        "is_new_user": False,
        "mastery_heatmap": mastery_heatmap,
        "high_risk_topics": high_risk_topics,
        "resume_topics": resume_topics,
        "improvement_topics": improvement_topics,
        "resume_strength_topics": resume_strength_topics,
        "recommended_quiz_topic": recommended_quiz,
        "recommended_assignment_topic": recommended_assignment,
        "performance_trend": trend[-10:],
        "study_plan": study_plan
    })



@router.get("/topics")
async def get_learning_topics(
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume_data = db.query(UserResumeData).filter(UserResumeData.user_id == current_user.id).first()
    topics = []
    
    if resume_data:
        all_topics = (resume_data.topics or []) + (resume_data.suggested_topics or [])
        for i, t in enumerate(all_topics):
            topics.append({
                "id": str(i+1),
                "title": t,
                "description": f"Master core concepts of {t}",
                "progress": 60 if i % 2 == 0 else 20,
                "totalModules": 10,
                "completedModules": 6 if i % 2 == 0 else 2
            })
    
    if not topics:
        topics = [
            {
                "id": "1",
                "title": "Data Structures & Algorithms",
                "description": "Master core DSA concepts",
                "progress": 60,
                "totalModules": 20,
                "completedModules": 12
            },
            {
                "id": "2",
                "title": "Frontend Development",
                "description": "React, UI/UX, Performance",
                "progress": 40,
                "totalModules": 15,
                "completedModules": 6
            }
        ]
        
    return success_response(data=topics)


@router.get("/topic/{topic_id}")
async def get_topic_detail(
    topic_id: str,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    title = f"Topic {topic_id}"
    resume_data = db.query(UserResumeData).filter(UserResumeData.user_id == current_user.id).first()
    
    if resume_data:
        all_topics = (resume_data.topics or []) + (resume_data.suggested_topics or [])
        try:
            index = int(topic_id) - 1
            if 0 <= index < len(all_topics):
                title = all_topics[index]
        except ValueError:
            pass
            
    if title == f"Topic {topic_id}":
        if topic_id == "1":
            title = "Data Structures & Algorithms"
        elif topic_id == "2":
            title = "Frontend Development"

    return success_response(data={
        "id": topic_id,
        "title": title,
        "summary": f"Complete all modules below to master {title}.",
        "modules": [
            {"id": "m1", "title": "Fundamentals", "completed": True},
            {"id": "m2", "title": "Advanced Concepts", "completed": False},
            {"id": "m3", "title": "Practical Application", "completed": False}
        ]
    })


@router.get("/resources")
async def get_learning_resources(
    topic: str,
    level: str,
    current_user: Any = Depends(get_current_user)
):
    """Fetch structured internet resources automatically scaled by level."""
    resources = await fetch_internet_resources(topic, level)
    return success_response(data=resources)

