const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://supervisortasks-production.up.railway.app';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new ApiError(response.status, `API error: ${response.statusText}`);
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
    getAll: () => fetchApi('/api/tasks'),
  },
  discussions: {
    getAll: () => fetchApi('/api/discussions'),
  },
  supervisors: {
    getAll: () => fetchApi('/api/supervisors'),
  },
};
