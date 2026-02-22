from openai import OpenAI
from core.config import settings
import json
from fastapi import HTTPException, status

# Initialize OpenAI client; API key is read from settings (environment variable)
client = OpenAI(api_key=settings.OPENAI_API_KEY)

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
        "  recommendations: array\n"
        "}\n"
    )
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # best available model; fallback to gpt-4 if needed
            messages=[{"role": "system", "content": system_prompt},
                      {"role": "user", "content": resume_text}],
            temperature=0,
        )
        # The model should return a JSON string in the content
        content = response.choices[0].message.content.strip()
        # Attempt to parse JSON safely
        try:
            result = json.loads(content)
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to parse AI response as JSON.",
            )
        return result
    except Exception as e:
        # Log minimal info; do not expose API key or raw resume
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI service error: " + str(e),
        )
