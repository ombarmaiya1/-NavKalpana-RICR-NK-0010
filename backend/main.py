from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models.user import User  # Import User model to register it with SQLAlchemy Base
from routes import auth, resume

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

@app.get("/")
def root():
    return {"message": "FastAPI Auth System is running"}
