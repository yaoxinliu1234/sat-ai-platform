#!/usr/bin/env python3
import uvicorn
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.main import app
    print("✅ FastAPI app imported successfully")
    
    # Test database initialization
    from app.db.session import SessionLocal
    from app.db.init_db import init_db
    
    db = SessionLocal()
    try:
        init_db(db)
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
    finally:
        db.close()
    
    print("🚀 Starting server...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 