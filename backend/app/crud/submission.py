from typing import List
from sqlalchemy.orm import Session
from app.models.submission import Submission
from app.models.question import Question
from app.schemas.submission import SubmissionCreate

def get_user_submissions(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Submission]:
    return db.query(Submission).filter(Submission.user_id == user_id).offset(skip).limit(limit).all()

def create_submission(db: Session, submission: SubmissionCreate, user_id: int) -> Submission:
    # Get the question to check the correct answer
    question = db.query(Question).filter(Question.id == submission.question_id).first()
    if not question:
        raise ValueError("Question not found")
    
    # Check if the answer is correct
    is_correct = submission.user_answer.strip().lower() == question.answer.strip().lower()
    
    db_submission = Submission(
        user_id=user_id,
        question_id=submission.question_id,
        user_answer=submission.user_answer,
        is_correct=is_correct,
        time_spent=submission.time_spent
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

def get_user_stats(db: Session, user_id: int) -> dict:
    total_submissions = db.query(Submission).filter(Submission.user_id == user_id).count()
    correct_submissions = db.query(Submission).filter(
        Submission.user_id == user_id, 
        Submission.is_correct == True
    ).count()
    
    accuracy = (correct_submissions / total_submissions * 100) if total_submissions > 0 else 0
    
    return {
        "total_questions": total_submissions,
        "correct_answers": correct_submissions,
        "accuracy": round(accuracy, 2)
    } 