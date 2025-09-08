from sqlalchemy.orm import Session
from app.crud.user import create_user
from app.crud.question import create_question
from app.schemas.user import UserCreate
from app.schemas.question import QuestionCreate
from app.db.base_class import Base
from app.db.session import engine

def init_db(db: Session) -> None:
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create initial questions
    initial_questions = [
        {
            "type": "mcq",
            "topic": "algebra",
            "stem": "2x + 3 = 7，x = ?",
            "options": ["1", "2", "3", "4"],
            "answer": "2",
            "difficulty": "easy"
        },
        {
            "type": "short_answer",
            "topic": "geometry",
            "stem": "半径为 3 的圆面积（两位小数）≈ ?",
            "answer": "28.27",
            "difficulty": "medium"
        },
        {
            "type": "mcq",
            "topic": "algebra",
            "stem": "如果 3x - 5 = 16，那么 x = ?",
            "options": ["5", "6", "7", "8"],
            "answer": "7",
            "difficulty": "easy"
        },
        {
            "type": "mcq",
            "topic": "geometry",
            "stem": "一个正方形的边长是 4，它的面积是多少？",
            "options": ["8", "12", "16", "20"],
            "answer": "16",
            "difficulty": "easy"
        },
        {
            "type": "short_answer",
            "topic": "algebra",
            "stem": "解方程：x² - 5x + 6 = 0，较小的解是多少？",
            "answer": "2",
            "difficulty": "medium"
        }
    ]
    
    # Check if questions already exist
    from app.crud.question import get_questions
    existing_questions = get_questions(db, limit=1)
    
    if not existing_questions:
        for q_data in initial_questions:
            question = QuestionCreate(**q_data)
            create_question(db=db, question=question)
        print("Initial questions created successfully!")
    else:
        print("Questions already exist, skipping initialization.") 