import json
import uuid
from typing import Dict, Tuple

from ai.provider_factory import get_ai_provider
from schemas.interview_schema import (
    AnswerRecord,
    AnswerScoreBreakdown,
    InterviewQuestion,
    InterviewSession,
    ResumeAnalysis,
    ScoringWeights,
    StartInterviewRequest,
    StartInterviewResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
)


_SESSIONS: Dict[str, InterviewSession] = {}


def _classify_category_for_aggregation(category: str) -> str:
    c = category.lower()
    if "behavior" in c or "hr" in c:
        return "behavioral"
    return "technical"


def _compute_readiness_score(
    session: InterviewSession,
) -> Tuple[float, str]:
    resume_strength = session.resume_analysis.resume_strength_score
    role_match = session.resume_analysis.role_skill_match_score

    technical_perf = (
        session.technical_score_total / max(1, len(session.questions))
    )
    behavioral_questions = [
        q for q in session.questions if _classify_category_for_aggregation(q.category) == "behavioral"
    ]
    behavioral_count = len(behavioral_questions)
    behavioral_perf = (
        session.behavioral_score_total / max(1, behavioral_count)
        if behavioral_count
        else technical_perf
    )

    irs = (
        resume_strength * 0.20
        + technical_perf * 0.40
        + behavioral_perf * 0.20
        + role_match * 0.20
    )

    if irs >= 85:
        classification = "Highly Ready"
    elif irs >= 70:
        classification = "Moderately Ready"
    elif irs >= 50:
        classification = "Developing"
    else:
        classification = "Needs Significant Improvement"

    return irs, classification


def _compute_career_readiness_score(
    session: InterviewSession,
    consistency_score: float = 50.0,
) -> float:
    """
    Compute Career Readiness Score (CRS).

    For now we approximate:
    - Learning Mastery using resume_strength_score
    - Role Alignment using role_skill_match_score
    - Consistency Score passed in (default mid-range).
    """
    resume_strength = session.resume_analysis.resume_strength_score
    role_match = session.resume_analysis.role_skill_match_score
    interview_readiness, _ = _compute_readiness_score(session)

    learning_mastery = resume_strength
    role_alignment = role_match

    crs = (
        learning_mastery * 0.30
        + interview_readiness * 0.40
        + consistency_score * 0.10
        + role_alignment * 0.20
    )
    return crs

async def start_interview(
    user_id: int,
    req: StartInterviewRequest,
) -> StartInterviewResponse:
    provider = get_ai_provider()

    system_prompt = (
        "You are an expert technical interviewer and career coach.\n"
        "You must return STRICT JSON only, no markdown, matching the schema provided.\n"
    )

    user_prompt = (
        "Analyze the candidate resume and generate 5-7 interview questions.\n\n"
        f"Target role: {req.role}\n"
        f"Skill stack: {', '.join(req.skills)}\n"
        f"Difficulty preference: {req.difficulty}\n\n"
        "Resume text:\n"
        f"{req.resume_text}\n\n"
        "1) First, compute:\n"
        "- resume_strength_score (0-100)\n"
        "- role_skill_match_score (0-100)\n"
        "- missing_skills (list of important skills missing for this role)\n\n"
        "2) Then generate between 5 and 7 questions across these categories:\n"
        "- Technical\n"
        "- Behavioral\n"
        "- System Design\n"
        "- Project Deep Dive\n\n"
        "For each question, provide:\n"
        "- question_id (short unique string)\n"
        "- category (one of: Technical, Behavioral, System Design, Project Deep Dive)\n"
        "- difficulty (Easy, Medium, Hard)\n"
        "- question_text\n"
        "- expected_keywords (3-8 key phrases you expect in a strong answer)\n"
        "- evaluation_guidelines (1-3 sentences)\n"
        "- scoring_weights: always use {\"keyword\":0.30,\"technical\":0.30,\"logical\":0.20,\"terminology\":0.10,\"completeness\":0.10}\n\n"
        "Return JSON ONLY in this shape:\n"
        "{\n"
        "  \"resume_analysis\": {\n"
        "    \"resume_strength_score\": 0,\n"
        "    \"role_skill_match_score\": 0,\n"
        "    \"missing_skills\": []\n"
        "  },\n"
        "  \"questions\": [\n"
        "    {\n"
        "      \"question_id\": \"q1\",\n"
        "      \"category\": \"Technical\",\n"
        "      \"difficulty\": \"Medium\",\n"
        "      \"question_text\": \"...\",\n"
        "      \"expected_keywords\": [\"...\"],\n"
        "      \"evaluation_guidelines\": \"...\",\n"
        "      \"scoring_weights\": {\n"
        "        \"keyword\": 0.30,\n"
        "        \"technical\": 0.30,\n"
        "        \"logical\": 0.20,\n"
        "        \"terminology\": 0.10,\n"
        "        \"completeness\": 0.10\n"
        "      }\n"
        "    }\n"
        "  ]\n"
        "}\n"
    )

    raw = await provider.generate(system_prompt + "\n\n" + user_prompt)

    if raw.startswith("```json"):
        raw = raw[7:-3]
    elif raw.startswith("```"):
        raw = raw[3:-3]

    data = json.loads(raw)

    resume_analysis = ResumeAnalysis(**data["resume_analysis"])
    questions = [InterviewQuestion(**q) for q in data["questions"]]

    session_id = str(uuid.uuid4())
    session = InterviewSession(
        session_id=session_id,
        user_id=user_id,
        resume_analysis=resume_analysis,
        questions=questions,
        status="initialized",
    )
    _SESSIONS[session_id] = session

    return StartInterviewResponse(
        session_id=session_id,
        first_question=session.questions[0],
        total_questions=len(session.questions),
    )


async def submit_answer(
    req: SubmitAnswerRequest,
) -> SubmitAnswerResponse:
    session = _SESSIONS.get(req.session_id)
    if not session:
        raise ValueError("Invalid or expired session_id.")

    if session.current_question_index >= len(session.questions):
        raise ValueError("All questions have already been answered.")

    question = session.questions[session.current_question_index]
    provider = get_ai_provider()

    weights = question.scoring_weights

    eval_prompt = (
        "You are evaluating a single interview answer.\n"
        "Return STRICT JSON only, no markdown.\n\n"
        f"Question category: {question.category}\n"
        f"Difficulty: {question.difficulty}\n"
        f"Question: {question.question_text}\n"
        f"Expected keywords: {', '.join(question.expected_keywords)}\n"
        f"Evaluation guidelines: {question.evaluation_guidelines}\n\n"
        "Candidate answer:\n"
        f"{req.answer_text}\n\n"
        "Score the answer on these components (0-100 each):\n"
        f"- keyword (weight {weights.keyword})\n"
        f"- technical (weight {weights.technical})\n"
        f"- logical (weight {weights.logical})\n"
        f"- terminology (weight {weights.terminology})\n"
        f"- completeness (weight {weights.completeness})\n\n"
        "Then compute total as the weighted sum of these components.\n"
        "Also identify a short list of missing_concepts (terms, ideas, or steps that should be improved).\n"
        "Provide actionable feedback in 2-4 sentences.\n\n"
        "Additionally, evaluate communication clarity (0-100) considering grammar, structure (e.g. STAR), redundancy, and articulation.\n"
        "Classify it into one of: \"Excellent\", \"Good\", \"Fair\", \"Needs Improvement\".\n\n"
        "Return JSON ONLY in this shape:\n"
        "{\n"
        "  \"scores\": {\n"
        "    \"keyword\": 0,\n"
        "    \"technical\": 0,\n"
        "    \"logical\": 0,\n"
        "    \"terminology\": 0,\n"
        "    \"completeness\": 0,\n"
        "    \"total\": 0\n"
        "  },\n"
        "  \"missing_concepts\": [\"...\"],\n"
        "  \"feedback\": \"...\",\n"
        "  \"communication\": {\n"
        "    \"cci_score\": 0,\n"
        "    \"cci_classification\": \"\"\n"
        "  }\n"
        "}\n"
    )

    raw = await provider.generate(eval_prompt)

    if raw.startswith("```json"):
        raw = raw[7:-3]
    elif raw.startswith("```"):
        raw = raw[3:-3]

    data = json.loads(raw)

    scores = AnswerScoreBreakdown(**data["scores"])

    recomputed_total = (
        scores.keyword * weights.keyword
        + scores.technical * weights.technical
        + scores.logical * weights.logical
        + scores.terminology * weights.terminology
        + scores.completeness * weights.completeness
    )
    scores.total = recomputed_total

    missing_concepts = data.get("missing_concepts", [])
    feedback = data.get("feedback", "")

    comm = data.get("communication", {}) or {}
    cci_score = comm.get("cci_score")
    cci_classification = comm.get("cci_classification")

    record = AnswerRecord(
        question_id=question.question_id,
        answer_text=req.answer_text,
        scores=scores,
        missing_concepts=missing_concepts,
        feedback=feedback,
    )
    session.answers.append(record)

    agg_category = _classify_category_for_aggregation(question.category)
    if agg_category == "technical":
        session.technical_score_total += scores.total
    else:
        session.behavioral_score_total += scores.total

    is_last = session.current_question_index == len(session.questions) - 1

    session.current_question_index += 1
    if is_last:
        session.status = "completed"
    else:
        session.status = "in_progress"

    next_question = (
        None if is_last else session.questions[session.current_question_index]
    )

    irs = None
    classification = None
    crs = None
    if is_last:
        irs, classification = _compute_readiness_score(session)
        crs = _compute_career_readiness_score(session)

    return SubmitAnswerResponse(
        final_score=scores.total,
        component_breakdown=scores,
        missing_concepts=missing_concepts,
        feedback=feedback,
        next_question=next_question,
        is_last_question=is_last,
        interview_readiness_score=irs,
        readiness_classification=classification,
        cci_score=cci_score,
        cci_classification=cci_classification,
        career_readiness_score=crs,
    )

