from ai.provider_factory import get_ai_provider
import json
from typing import List, Optional

def calculate_mastery(
    quiz_score: Optional[float],
    assignment_score: Optional[float],
    consistency: float
) -> float:
    """Calculates weighted mastery score based on performance and activity."""
    
    if quiz_score is not None and assignment_score is not None:
        mastery = (quiz_score * 0.50) + (assignment_score * 0.30) + (consistency * 0.20)
    elif quiz_score is not None:
        mastery = (quiz_score * 0.70) + (consistency * 0.30)
    elif assignment_score is not None:
        mastery = (assignment_score * 0.60) + (consistency * 0.40)
    else:
        mastery = consistency # Fallback if no scores yet
        
    return round(min(100, max(0, mastery)), 2)

def calculate_risk(mastery: float) -> str:
    """Detects risk levels based on mastery score."""
    if mastery < 40:
        return "High Risk"
    elif mastery <= 70:
        return "Moderate"
    else:
        return "Strong"

def adaptive_difficulty(last_three_scores: List[float]) -> str:
    """Determines difficulty scaling based on recent performance trend."""
    if not last_three_scores:
        return "maintain"
    
    avg = sum(last_three_scores) / len(last_three_scores)
    
    if avg > 75:
        return "increase"
    elif avg < 50:
        return "decrease"
    else:
        return "maintain"

async def generate_study_plan(
    weak_topics: List[str],
    role: str
) -> dict:
    """Generates a structured weekly study plan focusing on weak areas."""
    
    if not weak_topics:
        return {
            "weekly_goal": "Maintain strong performance across all topics.",
            "daily_tasks": [],
            "mini_projects": ["Advanced Architecture Mini-Project"],
            "revision_schedule": ["Weekly cumulative review"]
        }

    system_prompt = (
        "You are an AI academic planner.\n"
        f"Generate a structured weekly study plan for a {role} focusing on these weak topics: {', '.join(weak_topics)}.\n"
        "Return ONLY JSON with the following structure:\n"
        "{\n"
        "  \"weekly_goal\": \"string\",\n"
        "  \"daily_tasks\": [\n"
        "    {\n"
        "      \"day\": \"string\",\n"
        "      \"focus_topic\": \"string\",\n"
        "      \"tasks\": [\"string\", \"string\"]\n"
        "    }\n"
        "  ],\n"
        "  \"mini_projects\": [\"string\"],\n"
        "  \"revision_schedule\": [\"string\"]\n"
        "}\n"
    )

    try:
        provider = get_ai_provider()
        content = await provider.generate(system_prompt + "\n\nGenerate structured weekly study plan in JSON only.")
        
        # Clean potential markdown
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        return json.loads(content)
    except Exception as e:
        print(f"[learning_engine] AI Study Plan error: {str(e)}")
        # Fallback basic plan
        return {
            "weekly_goal": f"Strengthen fundamentals in {', '.join(weak_topics[:2])}",
            "daily_tasks": [
                {"day": "Day 1-2", "focus_topic": weak_topics[0] if weak_topics else "General", "tasks": ["Watch tutorial", "Practical exercise"]},
                {"day": "Day 3-4", "focus_topic": weak_topics[1] if len(weak_topics) > 1 else "General", "tasks": ["Read documentation", "Build small module"]}
            ],
            "mini_projects": ["Knowledge Reinforcement Project"],
            "revision_schedule": ["End of week quiz"]
        }

async def generate_starter_plan(
    resume_topics: List[str],
    suggested_topics: List[str],
    role: str
) -> dict:
    """Generates a foundational starter plan for new users."""
    
    system_prompt = (
        "You are an academic planner.\n"
        f"User has not attempted any quiz or assignment for the role of {role}.\n"
        f"Based on their Resume Topics: {', '.join(resume_topics)}\n"
        f"And Suggested Learning Topics: {', '.join(suggested_topics)}\n"
        "Generate a beginner-friendly 7 day starter plan.\n"
        "Return ONLY JSON with the structure:\n"
        "{\n"
        "  \"weekly_goal\": \"string\",\n"
        "  \"daily_tasks\": [\n"
        "    {\n"
        "      \"day\": \"string\",\n"
        "      \"focus_topic\": \"string\",\n"
        "      \"tasks\": [\"string\"]\n"
        "    }\n"
        "  ],\n"
        "  \"mini_projects\": [\"string\"],\n"
        "  \"revision_schedule\": [\"string\"]\n"
        "}\n"
    )

    try:
        provider = get_ai_provider()
        content = await provider.generate(system_prompt + "\n\nGenerate beginner-friendly starter plan in JSON only.")
        
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        return json.loads(content)
    except Exception as e:
        print(f"[learning_engine] AI Starter Plan error: {str(e)}")
        return {
            "weekly_goal": "Establish a strong technical foundation.",
            "daily_tasks": [
                {"day": "Day 1-3", "focus_topic": resume_topics[0] if resume_topics else "Core Fundamentals", "tasks": ["Quick review of existing skills"]},
                {"day": "Day 4-7", "focus_topic": suggested_topics[0] if suggested_topics else "New Concepts", "tasks": ["Introduction to recommended topics"]}
            ],
            "mini_projects": ["Self-Assessment Project"],
            "revision_schedule": ["First diagnostic quiz"]
        }
