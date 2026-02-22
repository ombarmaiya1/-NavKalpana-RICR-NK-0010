import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Authentication System"

    # ── JWT ─────────────────────────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── Database ────────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./app.db"

    # ── OpenAI ──────────────────────────────────────────────────────────────
    OPENAI_API_KEY: str = ""   # Optional: leave empty to use rule-based analysis

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# ── Startup validation ───────────────────────────────────────────────────────
# Warn (not crash) if the key is missing or placeholder so the app is still
# usable with the rule-based fallback for resume analysis.
if not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "PASTE_YOUR_KEY_HERE":
    print(
        "[config] WARNING: OPENAI_API_KEY is not set in backend/.env. "
        "Resume analysis will use rule-based scoring only."
    )
