from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./sat_ai.db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 * 24 * 60  # 30 days
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "SAT AI Backend"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:5173",  # Vite dev server
        "chrome-extension://*"
    ]
    
    class Config:
        env_file = ".env"

settings = Settings() 