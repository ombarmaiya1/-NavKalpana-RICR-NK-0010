from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Request
from pydantic import BaseModel
from typing import List, Any, Optional
import fitz  # PyMuPDF

from routes.auth import get_current_user
from core.config import settings
from services.resume_ai import analyze_resume_with_ai

router = APIRouter(prefix="/api/resume", tags=["Resume Analysis"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

@router.post("/analyze")
async def analyze_resume(
    request: Request,
    role: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: Any = Depends(get_current_user),
):
    """Analyze a resume either from uploaded PDF or raw text.

    Returns a JSON payload with scoring and recommendations.
    """
    resume_text = ""
    
    # Determine source of resume text
    if file is not None:
        # Validate content type
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only PDF files are accepted.",
            )
        # Read file bytes
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 5 MB limit.",
            )
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            resume_text = "\n".join(page.get_text() for page in doc)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to extract text from PDF.",
            )
        if not role:
            raise HTTPException(status_code=400, detail="Role is required when uploading a PDF.")
    else:
        # Use JSON body
        try:
            body = await request.json()
            resume_text = body.get("resume_text", "")
            role = body.get("role", "")
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body or missing file.")

    if not resume_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is empty.",
        )

    # Ensure OpenAI API key is configured
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenAI API key is not configured.",
        )

    # Call AI analysis service
    ai_result = await analyze_resume_with_ai(resume_text, role)

    # Compute weighted resume strength
    try:
        skill_relevance = int(ai_result.get("skill_relevance", 0))
        project_depth = int(ai_result.get("project_depth", 0))
        experience_score = int(ai_result.get("experience_score", 0))
        structure_score = int(ai_result.get("structure_score", 0))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid scoring data from AI response.",
        )

    resume_strength = round(
        skill_relevance * 0.40
        + project_depth * 0.30
        + experience_score * 0.20
        + structure_score * 0.10
    )

    response_payload = {
        "resume_strength": resume_strength,
        "skill_relevance": skill_relevance,
        "project_depth": project_depth,
        "experience_score": experience_score,
        "structure_score": structure_score,
        "missing_skills": ai_result.get("missing_skills", []),
        "recommendations": ai_result.get("recommendations", []),
    }
    return response_payload
