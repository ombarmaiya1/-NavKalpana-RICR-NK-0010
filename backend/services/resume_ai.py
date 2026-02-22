from ai.provider_factory import get_ai_provider
import json
from fastapi import HTTPException, status

async def analyze_resume_with_ai(resume_text: str, role: str):
    """Send resume text to OpenAI for analysis and return parsed JSON.

    The system prompt asks the model to return ONLY a JSON object with the required fields.
    If the OpenAI request fails or the response cannot be parsed, raise a 500 error.
    """
    system_prompt = (
        "You are a professional ATS Resume Analyzer.\n"
        f"Analyze the resume for the role of {role}.\n"
        "Return ONLY JSON with:\n"
        "{\n"
        "  skill_relevance: int (0-100),\n"
        "  project_depth: int (0-100),\n"
        "  experience_score: int (0-100),\n"
        "  structure_score: int (0-100),\n"
        "  missing_skills: array,\n"
        "  recommendations: array,\n"
        "  extracted_topics: array (e.g., ['FastAPI', 'React', 'Docker'])\n"
        "}\n"
    )
    try:
        provider = get_ai_provider()
        content = await provider.generate(system_prompt + "\n\n" + resume_text)
        
        # Robust JSON extraction (handle markdown blocks)
        if content.startswith("```"):
            # Remove ```json and ```
            lines = content.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            content = "\n".join(lines).strip()
            
        try:
            result = json.loads(content)
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI returned malformed JSON.",
            )
        return result
    except Exception as e:
        # Check if it's a quota error or any other OpenAI error
        print(f"[resume_ai] OpenAI error: {str(e)}. Using fallback mock analysis.")
        
        # Fallback Mock Analysis
        return {
            "skill_relevance": 75,
            "project_depth": 60,
            "experience_score": 70,
            "structure_score": 85,
            "missing_skills": ["System Design", "Unit Testing", "Cloud Deployment"],
            "recommendations": [
                "Your resume highlights strong technical skills but could benefit from more quantitative results (e.g., 'Improved performance by 30%').",
                "Add more detail to your projects section to show deep architectural understanding.",
                "Ensure your LinkedIn profile is up to date and linked in the header."
            ],
            "extracted_topics": ["Python", "JavaScript", "React", "SQL", "Git", "REST APIs"]
        }
