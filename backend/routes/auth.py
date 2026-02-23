from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.user import User
from schemas.user_schema import UserCreate, UserLogin, UserResponse, Token, UserUpdate, PasswordUpdate
from core.security import hash_password, verify_password, create_access_token
from core.config import settings
from core.response_utils import success_response, error_response
from jose import jwt, JWTError
from datetime import timedelta
from fastapi import File, UploadFile, Form
from services.resume_ai import analyze_resume_with_ai
import fitz # PyMuPDF

router = APIRouter(prefix="/api/auth", tags=["Auth"])

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    
    # The prompt explicitly specifies the message "Token expired" or 401
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError:
        # For simplicity and strict rule following, catch JWTError and return generic expired message
        raise credentials_exception
        
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    try:
        db_user = db.query(User).filter(User.email == email).first()
        if db_user:
            return error_response("Email already registered", status_code=400)
        
        hashed_pwd = hash_password(password)
        new_user = User(email=email, name=name, hashed_password=hashed_pwd)
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Handle Resume Upload if provided
        if file and role:
            content = await file.read()
            doc = fitz.open(stream=content, filetype="pdf")
            resume_text = "\n".join([page.get_text() for page in doc])
            doc.close()
            
            ai_result = await analyze_resume_with_ai(resume_text, role)
            
            from models.quiz import UserResumeData
            new_resume_data = UserResumeData(
                user_id=new_user.id, 
                role=role, 
                topics=ai_result.get("extracted_topics", []),
                suggested_topics=ai_result.get("suggested_learning_topics", [])
            )
            db.add(new_resume_data)
            db.commit()

        return success_response(
            data={"id": new_user.id, "email": new_user.email, "name": new_user.name},
            message="User registered successfully",
            status_code=201
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(str(e), status_code=500)

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        return error_response("Invalid credentials", status_code=400)
        
    if not verify_password(user.password, db_user.hashed_password):
        return error_response("Invalid credentials", status_code=400)
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    token_data = {
        "sub": str(db_user.id),
        "user_id": db_user.id,
        "email": db_user.email
    }
    
    access_token = create_access_token(
        data=token_data, expires_delta=access_token_expires
    )
    
    return success_response(data={"access_token": access_token, "token_type": "bearer"})

@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_user)):
    return success_response(data={"id": current_user.id, "email": current_user.email, "name": current_user.name})

@router.put("/me", response_model=UserResponse)
def update_user_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_update.email and user_update.email != current_user.email:
        # Check if email is already taken by another user
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        current_user.email = user_update.email

    if user_update.name is not None:
        current_user.name = user_update.name

    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/password", status_code=status.HTTP_200_OK)
def update_password(
    password_update: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(password_update.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.hashed_password = hash_password(password_update.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
