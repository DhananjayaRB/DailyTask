import axios from 'axios';
import { Habit, Completion } from '../types';

// Use environment variable for API URL, fallback to relative path for Vercel
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Habits API
export const habitsApi = {
  getAll: async (): Promise<Habit[]> => {
    const response = await api.get('/habits');
    return response.data;
  },

  getById: async (id: string): Promise<Habit> => {
    const response = await api.get(`/habits/${id}`);
    return response.data;
  },

  create: async (habit: Omit<Habit, 'id'>): Promise<Habit> => {
    const response = await api.post('/habits', habit);
    return response.data;
  },

  update: async (id: string, updates: Partial<Habit>): Promise<Habit> => {
    const response = await api.put(`/habits/${id}`, updates);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },
};

// Completions API
export const completionsApi = {
  getAll: async (params?: { startDate?: string; endDate?: string; habitId?: string }): Promise<Completion[]> => {
    const response = await api.get('/completions', { params });
    return response.data;
  },

  getByHabitAndDate: async (habitId: string, date: string): Promise<{ completed: boolean }> => {
    const response = await api.get(`/completions/${habitId}/${date}`);
    return response.data;
  },

  save: async (completion: { habitId: string; date: string; completed: boolean }): Promise<Completion> => {
    const response = await api.post('/completions', completion);
    return response.data;
  },

  getStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/completions/stats/summary', { params });
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; database: string }> => {
  const response = await api.get('/health');
  return response.data;
};

