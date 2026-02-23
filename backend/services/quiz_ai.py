from ai.provider_factory import get_ai_provider
import json
from fastapi import HTTPException, status

async def generate_quiz(
    topic: str,
    level: str,
    role: str,
    difficulty: str = None
):
    """Generate an adaptive quiz based on mastery level and role."""
    
    print(f"Generating quiz for: {topic} {level}")
    
    # Adaptive logic for focus
    if level == "Basic":
        focus = "Concept clarity, Definitions, Simple examples"
    elif level == "Intermediate":
        focus = "Code snippets, Output prediction, Scenario-based MCQs"
    else:  # Advanced
        focus = "Optimization, Edge case reasoning, Real-world scenario, Debugging"
    
    system_prompt = (
        "You are a technical interviewer.\n\n"
        "Generate exactly 5 high-quality MCQs.\n\n"
        f"Topic: {topic}\n"
        f"Difficulty: {level}\n"
        f"Role: {role}\n"
        f"Focus Area: {focus}\n\n"
        "Rules:\n"
        "- No generic questions\n"
        "- No vague definitions\n"
        "- Questions must test applied understanding\n"
        "- At least 2 scenario-based\n"
        "- Include code snippet if topic allows\n\n"
        "Return JSON only:\n"
        "{\n"
        "  \"questions\": [\n"
        "    {\n"
        "      \"question\": \"\",\n"
        "      \"options\": [],\n"
        "      \"correct_answer\": \"\",\n"
        "      \"explanation\": \"\"\n"
        "    }\n"
        "  ]\n"
        "}"
    )

    provider = get_ai_provider()
    
    for attempt_num in range(2):
        try:
            content = await provider.generate(system_prompt)
            print("--- RAW AI OUTPUT (QUIZ) ---")
            print(content)
            print("----------------------------")
            
            # Clean potential markdown
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            data = json.loads(content)
            
            # Validation
            if "questions" not in data or not isinstance(data["questions"], list) or len(data["questions"]) != 5:
                raise ValueError("Payload must contain exactly 5 questions.")
                
            for i, q in enumerate(data["questions"]):
                if "options" not in q or not isinstance(q["options"], list) or len(q["options"]) != 4:
                    raise ValueError(f"Question {i+1} must have exactly 4 options.")
                if not q.get("question") or not q.get("correct_answer") or not q.get("explanation"):
                    raise ValueError(f"Question {i+1} has empty fields.")
                
                # Format to match existing frontend expectations
                q["id"] = i + 1
                q["type"] = "mcq_single"
                
            return {
                "title": f"{level} Quiz: {topic}",
                "topic": topic,
                "difficulty": level,
                "time_limit": 10,
                "questions": data["questions"]
            }
            
        except (json.JSONDecodeError, ValueError) as e:
            print(f"[quiz_ai] Error on attempt {attempt_num + 1}: {e}")
            if attempt_num == 1:
                raise HTTPException(status_code=500, detail=f"Failed to generate valid quiz JSON: {e}")
        except Exception as e:
            print(f"[quiz_ai] Provider error: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to generate AI quiz.")

    raise HTTPException(status_code=500, detail="Failed to generate quiz after multiple attempts.")
