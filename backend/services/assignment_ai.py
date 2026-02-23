from ai.provider_factory import get_ai_provider
import json
from fastapi import HTTPException, status

async def generate_assignment(
    topic: str,
    level: str,
    role: str
):
    """Generate a practical technical assignment adapted to a calculated level."""
    
    print(f"Generating assignment for: {topic} {level}")
    
    if level == "Basic":
        level_instructions = "Generate 1 small task + 1 conceptual question."
    elif level == "Intermediate":
        level_instructions = "Generate a multi-step problem. Include constraints."
    else:  # Advanced
        level_instructions = "Generate a mini project. Include: Problem statement, Requirements, Edge cases, Evaluation criteria."

    system_prompt = (
        "You are a senior technical educator.\n\n"
        f"Generate a practical assignment for:\n"
        f"Topic: {topic}\n"
        f"Level: {level}\n"
        f"Role: {role}\n\n"
        f"Level Instructions: {level_instructions}\n\n"
        "Return JSON only:\n"
        "{\n"
        "  \"title\": \"\",\n"
        "  \"difficulty\": \"\",\n"
        "  \"problem_statement\": \"\",\n"
        "  \"requirements\": [],\n"
        "  \"constraints\": [],\n"
        "  \"expected_output\": \"\",\n"
        "  \"evaluation_criteria\": []\n"
        "}\n\n"
        "Do NOT generate theory explanation.\n"
        "Do NOT ask random questions.\n"
        "Make it practical and skill-based."
    )

    provider = get_ai_provider()
    
    for attempt_num in range(2):
        try:
            content = await provider.generate(system_prompt)
            print("--- RAW AI OUTPUT (ASSIGNMENT) ---")
            print(content)
            print("----------------------------------")
            
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            data = json.loads(content)
            
            # Form instruction output based on received schema
            parts = []
            if "problem_statement" in data and data["problem_statement"]:
                parts.append(f"**Problem Statement:**\n{data['problem_statement']}")
            if "requirements" in data and isinstance(data["requirements"], list) and data["requirements"]:
                parts.append("**Requirements:**\n- " + "\n- ".join(str(r) for r in data["requirements"]))
            if "constraints" in data and isinstance(data["constraints"], list) and data["constraints"]:
                parts.append("**Constraints:**\n- " + "\n- ".join(str(c) for c in data["constraints"]))
            if "expected_output" in data and data["expected_output"]:
                parts.append(f"**Expected Output:**\n{data['expected_output']}")
                
            # Fallback if structure is malformed
            if not parts and "instructions" in data:
                instructions = data["instructions"]
            else:
                instructions = "\n\n".join(parts) or "Please refer to the title for instructions."

            eval_criteria = data.get("evaluation_criteria", "General correctness")
            if isinstance(eval_criteria, list):
                eval_criteria = ", ".join(str(e) for e in eval_criteria)
            
            return {
                "title": data.get("title", f"{level} Assignment on {topic}"),
                "type": "coding",
                "difficulty": data.get("difficulty", level),
                "instructions": instructions,
                "expected_deliverables": "Code submission",
                "evaluation_criteria": eval_criteria
            }
            
        except json.JSONDecodeError as e:
            print(f"[assignment_ai] JSON Error on attempt {attempt_num + 1}: {e}")
            if attempt_num == 1:
                raise HTTPException(status_code=500, detail="Failed to generate valid assignment JSON.")
        except Exception as e:
            print(f"[assignment_ai] Error generating assignment: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to generate AI assignment.")
            
    raise HTTPException(status_code=500, detail="Failed to generate assignment after retries.")

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
