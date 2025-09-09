import axios from 'axios';

// Hardcoded production URL for Vercel deployment
const API_BASE_URL = 'https://sat-ai-backend-1.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  email: string;
  is_active: boolean;
}

export interface Question {
  id: number;
  type: 'mcq' | 'short_answer';
  topic: string;
  stem: string;
  options?: string[];
  answer: string;
}

export interface Submission {
  id: number;
  question_id: number;
  user_answer: string;
  is_correct: boolean;
  created_at: string;
  question?: Question;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Auth API
export const authAPI = {
  register: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/token', 
      new URLSearchParams({ username: email, password }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  },
};

// Questions API
export const questionsAPI = {
  getQuestions: async (skip = 0, limit = 100, topic?: string): Promise<Question[]> => {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (topic) params.append('topic', topic);
    
    const response = await api.get(`/questions/?${params}`);
    return response.data;
  },
};

// Submissions API
export const submissionsAPI = {
  getSubmissions: async (skip = 0, limit = 100): Promise<Submission[]> => {
    const response = await api.get(`/submissions/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  createSubmission: async (questionId: number, userAnswer: string): Promise<Submission> => {
    const response = await api.post('/submissions/', {
      question_id: questionId,
      user_answer: userAnswer,
    });
    return response.data;
  },
};

export default api;
// Force rebuild Mon Sep  8 22:31:55 EDT 2025
