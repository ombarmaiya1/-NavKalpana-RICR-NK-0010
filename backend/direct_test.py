"""Standalone test: directly call the signup route logic without Uvicorn to expose the real error."""
import traceback
import sys
sys.path.insert(0, '.')

from database import SessionLocal, engine, Base
from models.user import User
from core.security import hash_password

# Make sure tables exist
Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    print("Checking for existing user...")
    db_user = db.query(User).filter(User.email == "direct_test@example.com").first()
    if db_user:
        print("User already exists, deleting for clean test...")
        db.delete(db_user)
        db.commit()

    print("Creating new user...")
    hashed_pwd = hash_password("password123")
    new_user = User(email="direct_test@example.com", name="Direct Test", hashed_password=hashed_pwd)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    print(f"SUCCESS! User created: id={new_user.id}, email={new_user.email}, name={new_user.name}")
    
except Exception as e:
    print(f"ERROR: {e}")
    traceback.print_exc()
finally:
    db.close()
