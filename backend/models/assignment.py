from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, index=True, nullable=False)
    topic = Column(String, index=True, nullable=False)
    type = Column(String, nullable=False) # coding | mini_project | case_study | etc
    difficulty = Column(String, nullable=False)
    instructions = Column(Text, nullable=False)
    expected_deliverables = Column(Text, nullable=False)
    evaluation_criteria = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    submissions = relationship("AssignmentSubmission", back_populates="assignment")

class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    code_text = Column(Text, nullable=True)
    file_path = Column(String, nullable=True)
    github_link = Column(String, nullable=True)
    score = Column(Float, nullable=True)
    evaluation_json = Column(JSON, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    assignment = relationship("Assignment", back_populates="submissions")
