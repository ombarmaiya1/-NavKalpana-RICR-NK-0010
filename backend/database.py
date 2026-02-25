from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings
import os

# Resolve the database URL to an absolute path for SQLite so the Uvicorn
# reload sub-process always opens the same file regardless of its CWD.
_db_url = settings.DATABASE_URL
if _db_url.startswith("sqlite:///./") or _db_url.startswith("sqlite:///"):
    _rel_path = _db_url.replace("sqlite:///./", "").replace("sqlite:///", "")
    if not os.path.isabs(_rel_path):
        _abs_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), _rel_path)
        _db_url = f"sqlite:///{_abs_path}"

print(f"[DB] Using database: {_db_url}")

engine = create_engine(
    _db_url,
    connect_args={"check_same_thread": False}  # Needed for SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

