import { Task } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://supervisortasks-production.up.railway.app';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface FetchOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  try {
    const { method = 'GET', body, headers = {} } = options;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new ApiError(response.status, `API error: ${response.statusText}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network or other errors
    console.error('API fetch error:', error);
    throw new Error('Failed to connect to the backend. Using mock data.');
  }
}

export const api = {
  tasks: {
    getAll: () => fetchApi<Task[]>('/api/tasks'),
    getById: (id: string) => fetchApi<Task>(`/api/tasks/${id}`),
    create: (task: any) => fetchApi<Task>('/api/tasks', { method: 'POST', body: task }),
    update: (id: string, updates: any) => fetchApi<Task>(`/api/tasks/${id}`, { method: 'PUT', body: updates }),
    delete: (id: string) => fetchApi(`/api/tasks/${id}`, { method: 'DELETE' }),
  },
  discussions: {
    getAll: () => fetchApi('/api/discussions'),
    getById: (id: string) => fetchApi(`/api/discussions/${id}`),
    create: (discussion: any) => fetchApi('/api/discussions', { method: 'POST', body: discussion }),
    update: (id: string, updates: any) => fetchApi(`/api/discussions/${id}`, { method: 'PUT', body: updates }),
    delete: (id: string) => fetchApi(`/api/discussions/${id}`, { method: 'DELETE' }),
    updateFeedback: (id: string, supervisorName: string, completed: boolean) => 
      fetchApi(`/api/discussions/${id}/feedback`, { 
        method: 'PUT', 
        body: { supervisorName, completed } 
      }),
  },
  supervisors: {
    getAll: () => fetchApi('/api/supervisors'),
    add: (supervisor: { name: string; rank?: string }) => fetchApi('/api/supervisors', { method: 'POST', body: supervisor }),
    remove: (name: string) => fetchApi(`/api/supervisors/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  },
  loa: {
    getAll: () => fetchApi('/api/loa'),
    create: (loa: any) => fetchApi('/api/loa', { method: 'POST', body: loa }),
    update: (id: string, updates: any) => fetchApi(`/api/loa/${id}`, { method: 'PUT', body: updates }),
    delete: (id: string) => fetchApi(`/api/loa/${id}`, { method: 'DELETE' }),
  },
  analytics: {
    getDashboard: () => fetchApi('/api/analytics'),
    getTaskDistribution: () => fetchApi('/api/analytics/task-distribution'),
  },
};
