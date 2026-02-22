import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Authentication System"
    # In production, this should be an environment variable
    SECRET_KEY: str = os.getenv("SECRET_KEY", "b3a4e9b9dbffb1b5f6a7d76b1f2b4c6e8f0a2d4c6e8b0a2d4c6e8b0a2d4c6e8b")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "sqlite:///./app.db"

    class Config:
        env_file = ".env"

settings = Settings()
