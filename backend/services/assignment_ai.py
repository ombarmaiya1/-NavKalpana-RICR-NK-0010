from ai.provider_factory import get_ai_provider
import json
from fastapi import HTTPException, status

async def generate_assignment(
    topic: str,
    mastery_score: float | None,
    role: str
):
    """Generate a technical assignment adapted to the user's mastery level."""
    
    # Adaptive Logic
    if mastery_score is None:
        difficulty = "Beginner"
        focus = "core fundamentals and beginner-friendly concepts"
        constraints = "Focus on clarity and simplicity. No advanced constraints."
    elif mastery_score < 40:
        difficulty = "Guided"
        focus = "step-by-step implementation of core mechanics"
        constraints = "Provide clear structural guidance. Breakdown the task into logical phases."
    elif mastery_score <= 70:
        difficulty = "Standard"
        focus = "practical application and standard industry patterns"
        constraints = "Focus on clean code, modularity, and proper error handling."
    else:
        difficulty = "Complex"
        focus = "advanced scenarios, edge cases, and performance optimization"
        constraints = "Add strict performance requirements, scalability concerns, or complex architectural constraints."

    # Capstone Logic
    if topic == "Career Execution Challenge":
        system_prompt = (
            "You are an expert technical architect designing a Capstone Career Execution Challenge.\n"
            f"Role: {role}.\n"
            "This capstone must combine ONE strong topic, ONE weak topic, and ONE real-world integration requirement.\n"
        )
    else:
        system_prompt = (
            "You are a professional technical assignment generator.\n"
            f"Generate an assignment on: {topic} for the role of {role}.\n"
            f"Difficulty: {difficulty}. Focus: {focus}.\n"
            f"Constraints: {constraints}\n"
        )

    system_prompt += (
        "Return ONLY JSON with this structure:\n"
        "{\n"
        "  \"title\": \"string\",\n"
        "  \"type\": \"coding\" | \"mini_project\" | \"case_study\" | \"debugging\" | \"system_design\",\n"
        "  \"difficulty\": \"string\",\n"
        "  \"instructions\": \"string (markdown allowed)\",\n"
        "  \"expected_deliverables\": \"string\",\n"
        "  \"evaluation_criteria\": \"string\"\n"
        "}\n"
    )

    try:
        provider = get_ai_provider()
        content = await provider.generate(system_prompt + f"\n\nGenerate assignment for {topic}.")
        
        # Clean markdown
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        return json.loads(content)
    except Exception as e:
        print(f"[assignment_ai] Error generating assignment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate AI assignment.")

async def evaluate_submission(
    assignment_context: dict,
    submission_data: dict
):
    """Evaluate a submission against assignment criteria."""
    
    system_prompt = (
        "You are an expert technical evaluator.\n"
        "Evaluate the following assignment submission strictly based on:\n"
        "- Logical correctness\n"
        "- Concept application\n"
        "- Code structure\n"
        "- Completeness\n"
        "- Efficiency\n\n"
        "Assignment Context:\n"
        f"Title: {assignment_context.get('title')}\n"
        f"Criteria: {assignment_context.get('evaluation_criteria')}\n\n"
        "Return ONLY JSON with this structure:\n"
        "{\n"
        "  \"score\": int (0-100),\n"
        "  \"concept_coverage\": \"string\",\n"
        "  \"mistakes\": [\"string\"],\n"
        "  \"improvement_suggestions\": [\"string\"]\n"
        "}\n"
    )

    user_content = (
        f"Submission Content:\n"
        f"Code/Text: {submission_data.get('code_text', 'N/A')}\n"
        f"GitHub: {submission_data.get('github_link', 'N/A')}\n"
    )

    try:
        provider = get_ai_provider()
        content = await provider.generate(system_prompt + user_content)
        
        # Clean markdown
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]
            
        return json.loads(content)
    except Exception as e:
        print(f"[assignment_ai] Error evaluating submission: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to evaluate submission.")
