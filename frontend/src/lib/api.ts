import axios from 'axios';
import type { Task, Discussion, Supervisor, LOARecord, Analytics, SupervisorMetrics } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tasks API
export const tasksAPI = {
  getAll: () => api.get<Task[]>('/tasks'),
  get: (id: string) => api.get<Task>(`/tasks/${id}`),
  create: (task: Omit<Task, 'id'>) => api.post<Task>('/tasks', task),
  update: (id: string, updates: Partial<Task>) => api.put<Task>(`/tasks/${id}`, updates),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  getHistory: () => api.get('/tasks/history/all'),
};

// Discussions API
export const discussionsAPI = {
  getAll: () => api.get<Discussion[]>('/discussions'),
  get: (id: string) => api.get<Discussion>(`/discussions/${id}`),
  create: (discussion: Omit<Discussion, 'id'>) => api.post<Discussion>('/discussions', discussion),
  updateFeedback: (id: string, supervisorName: string, completed: boolean) =>
    api.put<Discussion>(`/discussions/${id}/feedback`, { supervisorName, completed }),
  delete: (id: string) => api.delete(`/discussions/${id}`),
};

// Supervisors API
export const supervisorsAPI = {
  getAll: () => api.get<Supervisor[]>('/supervisors'),
  add: (name: string) => api.post<Supervisor>('/supervisors', { name }),
  remove: (name: string) => api.delete(`/supervisors/${name}`),
};

// LOA API
export const loaAPI = {
  getAll: () => api.get<LOARecord[]>('/loa'),
  getActive: () => api.get<LOARecord[]>('/loa/active'),
  get: (id: string) => api.get<LOARecord>(`/loa/${id}`),
  create: (record: Omit<LOARecord, 'id'>) => api.post<LOARecord>('/loa', record),
  update: (id: string, updates: Partial<LOARecord>) => api.put<LOARecord>(`/loa/${id}`, updates),
  delete: (id: string) => api.delete(`/loa/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getAll: () => api.get<Analytics>('/analytics'),
  getSupervisorMetrics: (name: string) => api.get<SupervisorMetrics>(`/analytics/supervisor/${name}`),
};

export default api;
