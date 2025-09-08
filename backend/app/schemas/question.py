from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QuestionBase(BaseModel):
    type: str  # 'mcq' or 'short_answer'
    topic: str
    stem: str
    options: Optional[List[str]] = None
    answer: str
    difficulty: str
    answer: str = "medium"

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(QuestionBase):
    type: Optional[str] = None
    topic: Optional[str] = None
    stem: Optional[str] = None
    answer: Optional[str] = None

class QuestionInDB(QuestionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Question(QuestionInDB):
    pass

class QuestionResponse(BaseModel):
    id: int
    type: str
    topic: str
    stem: str
    options: Optional[List[str]] = None
    difficulty: str
    answer: str
    
    class Config:
        from_attributes = True 