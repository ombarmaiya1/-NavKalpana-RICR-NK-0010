from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user_schema import UserCreate, UserLogin, UserResponse, Token, UserUpdate, PasswordUpdate
from core.security import hash_password, verify_password, create_access_token
from core.config import settings
from jose import jwt, JWTError
from datetime import timedelta

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

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed_pwd = hash_password(user.password)
        new_user = User(email=user.email, name=user.name, hashed_password=hashed_pwd)
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return new_user
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
        
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Token must include user_id, email, expiration
    # Expiration is handled by create_access_token
    token_data = {
        "sub": str(db_user.id),
        "user_id": db_user.id,
        "email": db_user.email
    }
    
    access_token = create_access_token(
        data=token_data, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

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
