from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SubmissionBase(BaseModel):
    question_id: int
    user_answer: str
    time_spent: Optional[int] = None

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionInDB(SubmissionBase):
    id: int
    user_id: int
    is_correct: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Submission(SubmissionInDB):
    pass

class SubmissionResponse(BaseModel):
    id: int
    question_id: int
    user_answer: str
    is_correct: bool
    time_spent: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True 