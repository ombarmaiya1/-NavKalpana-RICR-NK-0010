from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models.user import User  # Import User model to register it with SQLAlchemy Base
from models.quiz import TopicMastery, QuizAttempt, UserResumeData
from models.assignment import Assignment, AssignmentSubmission
from routes import auth, resume, quiz, assignment, learning

# Automatically create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI Auth System")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication Router
app.include_router(auth.router)

# Include Resume Router
app.include_router(resume.router)

# Include Quiz Router
app.include_router(quiz.router)

# Include Assignment Router
app.include_router(assignment.router)

# Include Learning Router
app.include_router(learning.router)

@app.get("/")
def root():
    return {"message": "FastAPI Auth System is running"}
