import uvicorn
from app.db.session import SessionLocal
from app.db.init_db import init_db

def main():
    # Initialize database
    db = SessionLocal()
    try:
        init_db(db)
    finally:
        db.close()
    
    # Start server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

if __name__ == "__main__":
    main() 