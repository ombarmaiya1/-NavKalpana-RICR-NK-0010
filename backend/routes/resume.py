from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Request
from pydantic import BaseModel
from typing import List, Any, Optional
import fitz  # PyMuPDF
from sqlalchemy.orm import Session
from database import get_db
from models.quiz import UserResumeData

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
    db: Session = Depends(get_db),
):
    """Analyze a resume either from uploaded PDF or raw text.

    Returns a JSON payload with scoring and recommendations.
    """
    resume_text = ""
    
    # Determine source of resume text
    if file is not None:
        # Validate content type or extension
        is_pdf = file.content_type == "application/pdf" or file.filename.lower().endswith(".pdf")
        if not is_pdf:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Only PDF files are accepted.",
            )
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size exceeds 5 MB limit.",
            )
        try:
            doc = fitz.open(stream=content, filetype="pdf")
            extracted_pages = []
            for page in doc:
                text = page.get_text()
                if text:
                    extracted_pages.append(text)
            resume_text = "\n".join(extracted_pages)
            doc.close()
        except Exception as e:
            print(f"[resume_route] PDF extraction failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to extract text from PDF: {str(e)}",
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

    # Save extracted topics to DB for Adaptive Quiz
    extracted_topics = ai_result.get("extracted_topics", [])
    suggested_topics = ai_result.get("suggested_learning_topics", [])
    if extracted_topics or suggested_topics:
        user_resume = db.query(UserResumeData).filter(UserResumeData.user_id == current_user.id).first()
        if user_resume:
            user_resume.topics = extracted_topics
            user_resume.suggested_topics = suggested_topics
            user_resume.role = role
        else:
            new_resume_data = UserResumeData(
                user_id=current_user.id, 
                role=role, 
                topics=extracted_topics,
                suggested_topics=suggested_topics
            )
            db.add(new_resume_data)
        db.commit()

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
        "extracted_topics": extracted_topics
    }
    return response_payload
