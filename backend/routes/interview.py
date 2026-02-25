from fastapi import APIRouter, Depends, File, Form, UploadFile
from typing import Any
from fastapi import HTTPException, status
from openai import OpenAI

from core.config import settings
from core.response_utils import success_response, error_response
from routes.auth import get_current_user
from schemas.interview_schema import (
    StartInterviewRequest,
    SubmitAnswerRequest,
)
from services.interview_ai import evaluate_interview_answer
from services.interview_session_service import (
    start_interview as svc_start_interview,
    submit_answer as svc_submit_answer,
)

router = APIRouter(prefix="/api/interview", tags=["Interview"])


@router.post("/start-interview")
async def start_interview(
    role: str = Form(...),
    skills: str = Form(...),
    difficulty: str = Form("Medium"),
    resume_file: UploadFile = File(...),
    current_user: Any = Depends(get_current_user),
):
    """
    Start an interview session from an uploaded resume file.

    - role: target job role
    - skills: comma-separated skills string
    - difficulty: Easy / Medium / Hard
    - resume_file: uploaded resume (PDF or text)
    """
    try:
        raw_bytes = await resume_file.read()
        if not raw_bytes:
            return error_response("Empty resume file received.", status_code=400)

        filename = (resume_file.filename or "").lower()

        resume_text = ""
        if filename.endswith(".pdf"):
            import fitz  # PyMuPDF

            doc = fitz.open(stream=raw_bytes, filetype="pdf")
            parts = []
            for page in doc:
                parts.append(page.get_text())
            resume_text = "\n".join(parts)
            doc.close()
        else:
            # Fallback: treat as UTF-8 text
            resume_text = raw_bytes.decode("utf-8", errors="ignore")

        if not resume_text.strip():
            return error_response(
                "Could not extract text from resume. Please upload a text-based or PDF resume.",
                status_code=400,
            )

        skill_list = [s.strip() for s in skills.split(",") if s.strip()]

        payload = StartInterviewRequest(
            resume_text=resume_text,
            role=role,
            skills=skill_list,
            difficulty=difficulty,
        )

        result = await svc_start_interview(
            user_id=current_user.id,
            req=payload,
        )
        return success_response(data=result.model_dump())
    except Exception as e:
        return error_response(
            "Failed to start interview session.",
            data={"error": str(e)},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@router.post("/submit-answer")
async def submit_answer(
    payload: SubmitAnswerRequest,
    current_user: Any = Depends(get_current_user),
):
    try:
        result = await svc_submit_answer(payload)
        return success_response(data=result.model_dump())
    except Exception as e:
        return error_response(
            "Failed to evaluate answer.",
            data={"error": str(e)},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@router.post("/voice-answer")
async def submit_voice_answer(
    audio: UploadFile = File(...),
    question: str = Form(...),
    current_user: Any = Depends(get_current_user),
):
    try:
        raw_bytes = await audio.read()
        if not raw_bytes:
            return error_response("Empty audio file received.", status_code=400)

        import io

        audio_file = io.BytesIO(raw_bytes)
        audio_file.name = audio.filename or "answer.webm"

        client = OpenAI(api_key=settings.OPENAI_API_KEY)

        transcription = client.audio.transcriptions.create(
            model="gpt-4o-transcribe",
            file=audio_file,
        )

        transcript_text = getattr(transcription, "text", None) or ""
        if not transcript_text.strip():
            return error_response(
                "Could not transcribe audio. Please try again.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        feedback = await evaluate_interview_answer(
            question=question,
            answer_transcript=transcript_text,
            role=getattr(current_user, "role", "Software Engineer"),
        )

        return success_response(
            data={
                "transcript": transcript_text,
                "feedback": feedback,
            }
        )
    except Exception as e:
        return error_response(
            "Failed to process voice answer.",
            data={"error": str(e)},
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

