from ai.provider_factory import get_ai_provider
import json
from fastapi import HTTPException, status

async def generate_quiz(
    topic: str,
    mastery_score: float | None,
    role: str,
    difficulty: str = None
):
    """Generate an adaptive quiz based on mastery score and role."""
    
    # Adaptive logic for difficulty and focus
    if mastery_score is None:
        # Diagnostic Mode
        difficulty = "Medium"
        focus = "baseline diagnostic covering fundamentals"
    elif mastery_score < 40:
        difficulty = "Easy to Medium"
        focus = "fundamentals and core concepts"
    elif mastery_score <= 70:
        difficulty = "Medium"
        focus = "concept application and practical usage"
    else:
        difficulty = "Medium to Hard"
        focus = "scenario-based challenges and tricky edge cases"
    
    system_prompt = (
        "You are an adaptive technical quiz generator.\n"
        f"Generate a quiz on the topic: {topic} for the role of {role}.\n"
        f"Difficulty: {difficulty}. Focus on {focus}.\n"
        "Return ONLY JSON with the following structure:\n"
        "{\n"
        "  \"title\": \"string\",\n"
        "  \"topic\": \"string\",\n"
        "  \"difficulty\": \"string\",\n"
        "  \"time_limit\": int (minutes),\n"
        "  \"questions\": [\n"
        "    {\n"
        "      \"id\": 1,\n"
        "      \"type\": \"mcq_single\" | \"mcq_multi\" | \"short\" | \"scenario\" | \"code_output\",\n"
        "      \"question\": \"string\",\n"
        "      \"options\": [\"string\", \"string\", ...],\n"
        "      \"correct_answer\": \"string\" | [\"string\"],\n"
        "      \"explanation\": \"string\"\n"
        "    }\n"
        "  ]\n"
        "}\n"
    )

    try:
        provider = get_ai_provider()
        content = await provider.generate(system_prompt + f"\n\nCreate a quiz for {topic}.")
        # Clean potential markdown
        if content.startswith("```json"):
            content = content[7:-3]
        
        return json.loads(content)
    except Exception as e:
        print(f"[quiz_ai] OpenAI error: {str(e)}. Using fallback mock quiz for {topic}.")
        
        # Fallback Mock Quiz
        return {
            "title": f"Fundamentals of {topic}",
            "topic": topic,
            "difficulty": difficulty or "Medium",
            "time_limit": 10,
            "questions": [
                {
                    "id": 1,
                    "type": "mcq_single",
                    "question": f"Which of the following describes a key concept in {topic}?",
                    "options": ["A core fundamental principle", "An unrelated secondary factor", "A legacy configuration", "None of the above"],
                    "correct_answer": "A core fundamental principle",
                    "explanation": f"In {topic}, this principle is essential for maintaining standard architectural patterns."
                },
                {
                    "id": 2,
                    "type": "mcq_single",
                    "question": f"What is the most common use case for {topic}?",
                    "options": ["Optimizing system state", "Managing distributed logs", "Handling direct user input", "It varies by industry"],
                    "correct_answer": "Optimizing system state",
                    "explanation": f"{topic} is frequently used to ensure state consistency across modern applications."
                },
                {
                    "id": 3,
                    "type": "mcq_single",
                    "question": f"Which tool is most commonly associated with {topic}?",
                    "options": ["The standard industry debugger", "A specialized framework library", "A plain text editor", "Legacy hardware controllers"],
                    "correct_answer": "A specialized framework library",
                    "explanation": f"Most professional environments utilize specific framework libraries to manage {topic} efficiently."
                }
            ]
        }
