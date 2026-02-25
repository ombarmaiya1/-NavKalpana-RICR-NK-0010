from ai.provider_factory import get_ai_provider


async def evaluate_interview_answer(
    question: str,
    answer_transcript: str,
    role: str = "Software Engineer",
) -> str:
    """
    Use the configured LLM provider to evaluate a spoken interview answer.

    Returns a natural-language feedback string that the frontend can display.
    """
    system_prompt = (
        "You are an expert interview coach.\n\n"
        f"Candidate role: {role}\n\n"
        "You will receive a technical or behavioral interview question and the "
        "candidate's spoken answer (already transcribed from audio).\n\n"
        "For the given question and answer, provide concise, high-signal feedback:\n"
        "- Start with a 1–2 sentence overall assessment.\n"
        "- Then give 3–5 specific, numbered suggestions for improvement.\n"
        "- Focus on structure (e.g. STAR), clarity, depth, and real-world examples.\n"
        "- Keep the total response under 250 words.\n\n"
        "Format your response as plain text that can be shown directly in the UI."
    )

    user_prompt = (
        f"Interview question:\n{question}\n\n"
        f"Candidate answer (transcribed):\n{answer_transcript}\n"
    )

    provider = get_ai_provider()
    feedback = await provider.generate(system_prompt + "\n\n" + user_prompt)
    return feedback

