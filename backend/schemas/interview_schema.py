from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class ScoringWeights(BaseModel):
    keyword: float = Field(0.30, ge=0, le=1)
    technical: float = Field(0.30, ge=0, le=1)
    logical: float = Field(0.20, ge=0, le=1)
    terminology: float = Field(0.10, ge=0, le=1)
    completeness: float = Field(0.10, ge=0, le=1)


class InterviewQuestion(BaseModel):
    question_id: str
    category: str
    difficulty: str
    question_text: str
    expected_keywords: List[str]
    evaluation_guidelines: str
    scoring_weights: ScoringWeights = Field(default_factory=ScoringWeights)


class ResumeAnalysis(BaseModel):
    resume_strength_score: float
    role_skill_match_score: float
    missing_skills: List[str]


class AnswerScoreBreakdown(BaseModel):
    keyword: float
    technical: float
    logical: float
    terminology: float
    completeness: float
    total: float


class AnswerRecord(BaseModel):
    question_id: str
    answer_text: str
    scores: AnswerScoreBreakdown
    missing_concepts: List[str]
    feedback: str


class InterviewSession(BaseModel):
    session_id: str
    user_id: int
    resume_analysis: ResumeAnalysis
    questions: List[InterviewQuestion]
    answers: List[AnswerRecord] = Field(default_factory=list)
    current_question_index: int = 0
    technical_score_total: float = 0.0
    behavioral_score_total: float = 0.0
    status: str = "initialized"


class StartInterviewRequest(BaseModel):
    resume_text: str
    role: str
    skills: List[str]
    difficulty: str = "Medium"


class StartInterviewResponse(BaseModel):
    session_id: str
    first_question: InterviewQuestion
    total_questions: int


class SubmitAnswerRequest(BaseModel):
    session_id: str
    answer_text: str


class SubmitAnswerResponse(BaseModel):
    final_score: float
    component_breakdown: AnswerScoreBreakdown
    missing_concepts: List[str]
    feedback: str
    next_question: Optional[InterviewQuestion] = None
    is_last_question: bool = False
    interview_readiness_score: Optional[float] = None
    readiness_classification: Optional[str] = None
    cci_score: Optional[float] = None
    cci_classification: Optional[str] = None
    career_readiness_score: Optional[float] = None

