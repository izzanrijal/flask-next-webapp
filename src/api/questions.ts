import axios from 'axios';
import { Question, GeneratedQuestion, System } from '../types/question';

const API_URL = 'http://localhost:3001/api';

// Configure axios with authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function fetchSystems(): Promise<System[]> {
  const response = await axios.get(`${API_URL}/systems`);
  return response.data;
}

export async function fetchQuestionsBySystem(systemId: number | null, page: number = 1): Promise<Question[]> {
  if (!systemId) return [];
  
  const response = await axios.get(`${API_URL}/questions`, {
    params: {
      systemId,
      page,
      limit: 50
    }
  });
  return response.data;
}

export async function fetchQuestionById(id: number): Promise<Question> {
  const response = await axios.get(`${API_URL}/questions/${id}`);
  return response.data;
}

export async function generateQuestion(question: Question): Promise<GeneratedQuestion> {
  const response = await axios.post(`${API_URL}/questions/${question.id}/generate`, {
    originalQuestion: question
  });
  // Ambil langsung objek soal dari response.data.result
  return response.data.result;
}

export async function updateQuestion({ id, question }: { id: number, question: GeneratedQuestion }): Promise<void> {
  await axios.patch(`${API_URL}/questions/${id}`, question);
}

export async function updateIsAccepted(id: number, is_accepted: boolean): Promise<void> {
  await axios.patch(`${API_URL}/questions/${id}/accept`, { is_accepted });
}

export async function fetchQuestionBefore(id: number): Promise<Question> {
  const response = await axios.get(`${API_URL}/questions/${id}/before`);
  return response.data;
}

export async function fetchProgressStats(): Promise<{ updatedCount: number; totalCount: number }> {
  const response = await axios.get(`${API_URL}/progress`);
  return response.data;
}