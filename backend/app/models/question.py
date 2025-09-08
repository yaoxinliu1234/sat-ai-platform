from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)  # 'mcq' or 'short_answer'
    topic = Column(String, nullable=False, index=True)  # 'algebra', 'geometry', etc.
    stem = Column(String, nullable=False)  # Question text
    options = Column(JSON, nullable=True)  # For MCQ questions
    answer = Column(String, nullable=False)  # Correct answer
    difficulty = Column(String, default="medium")  # 'easy', 'medium', 'hard'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 