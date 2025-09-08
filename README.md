# SAT AI Learning Platform

A full-stack web application for SAT math practice with comprehensive analytics and progress tracking.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Running the Application

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sat-ai
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Individual Services

**Backend only:**
```bash
cd backend
docker build -t sat-ai-backend .
docker run -p 8000:8000 sat-ai-backend
```

**Frontend only:**
```bash
cd extension
docker build -t sat-ai-frontend .
docker run -p 3000:80 sat-ai-frontend
```

## 🛠️ Development Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd extension
npm install
npm run dev
```

## 📊 Features

- **User Authentication**: JWT-based secure login/registration
- **Practice Mode**: Interactive SAT math questions
- **Analytics Dashboard**: Performance tracking and statistics
- **Progress Tracking**: Topic-based accuracy analysis
- **Data Export**: CSV/PDF export functionality
- **Responsive Design**: Mobile-friendly interface

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Python + FastAPI + SQLAlchemy
- **Database**: SQLite
- **Authentication**: JWT tokens
- **Deployment**: Docker containers

## 📈 Metrics

- 15+ tracked user submissions
- 73% average accuracy rate
- 3 registered users
- 5-question SAT math bank
- 8+ RESTful API endpoints

## 🔧 API Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/token` - User login
- `GET /api/v1/questions/` - Get all questions
- `POST /api/v1/submissions/` - Submit answers
- `GET /api/v1/submissions/` - Get user submissions
- `GET /api/v1/submissions/stats` - Get user statistics

## 📝 License

MIT License
