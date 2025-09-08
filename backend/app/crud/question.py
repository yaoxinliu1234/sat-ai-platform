from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.question import Question
from app.schemas.question import QuestionCreate, QuestionUpdate

def get_question(db: Session, question_id: int) -> Optional[Question]:
    return db.query(Question).filter(Question.id == question_id).first()

def get_questions(db: Session, skip: int = 0, limit: int = 100) -> List[Question]:
    return db.query(Question).offset(skip).limit(limit).all()

def get_questions_by_topic(db: Session, topic: str, limit: int = 10) -> List[Question]:
    return db.query(Question).filter(Question.topic == topic).limit(limit).all()

def get_random_questions(db: Session, limit: int = 10, topic: Optional[str] = None) -> List[Question]:
    query = db.query(Question)
    if topic:
        query = query.filter(Question.topic == topic)
    return query.order_by(func.random()).limit(limit).all()

def create_question(db: Session, question: QuestionCreate) -> Question:
    db_question = Question(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def update_question(db: Session, db_question: Question, question_update: QuestionUpdate) -> Question:
    update_data = question_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_question, field, value)
    
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

def delete_question(db: Session, question_id: int) -> bool:
    question = db.query(Question).filter(Question.id == question_id).first()
    if question:
        db.delete(question)
        db.commit()
        return True
    return False 