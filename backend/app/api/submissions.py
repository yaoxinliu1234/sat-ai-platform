from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.crud.submission import create_submission, get_user_submissions, get_user_stats
from app.db.session import get_db
from app.models.user import User
from app.schemas.submission import Submission, SubmissionCreate, SubmissionResponse

router = APIRouter()

@router.post("/", response_model=SubmissionResponse)
def submit_answer(
    submission: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        db_submission = create_submission(db=db, submission=submission, user_id=current_user.id)
        return db_submission
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/", response_model=List[SubmissionResponse])
def get_my_submissions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    submissions = get_user_submissions(db, user_id=current_user.id, skip=skip, limit=limit)
    return submissions

@router.get("/stats")
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stats = get_user_stats(db, user_id=current_user.id)
    return stats 