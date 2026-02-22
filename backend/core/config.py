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

    # ── AI Providers ────────────────────────────────────────────────────────
    AI_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()

# ── Startup validation ───────────────────────────────────────────────────────
if settings.AI_PROVIDER == "openai" and (not settings.OPENAI_API_KEY or settings.OPENAI_API_KEY == "PASTE_YOUR_KEY_HERE"):
    print("[config] WARNING: AI_PROVIDER is 'openai' but OPENAI_API_KEY is missing/placeholder.")

if settings.AI_PROVIDER == "gemini" and (not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "PASTE_YOUR_GEMINI_KEY_HERE"):
    print("[config] WARNING: AI_PROVIDER is 'gemini' but GEMINI_API_KEY is missing/placeholder.")

if settings.AI_PROVIDER not in ["openai", "gemini"]:
    print(f"[config] ERROR: Invalid AI_PROVIDER '{settings.AI_PROVIDER}'. Must be 'openai' or 'gemini'.")
