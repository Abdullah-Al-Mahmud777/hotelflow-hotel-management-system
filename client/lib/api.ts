// API configuration for frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  baseURL: API_BASE_URL,
  
  // Helper function for API calls
  async fetch(endpoint: string, options?: RequestInit) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Room endpoints
  rooms: {
    getAll: () => api.fetch('/rooms'),
    getById: (id: string) => api.fetch(`/rooms/${id}`),
    create: (data: any) => api.fetch('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.fetch(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.fetch(`/rooms/${id}`, { method: 'DELETE' }),
  },

  // Booking endpoints
  bookings: {
    getAll: () => api.fetch('/book'),
    getById: (id: string) => api.fetch(`/book/${id}`),
    create: (data: any) => api.fetch('/book', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => api.fetch(`/book/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => api.fetch(`/book/${id}`, { method: 'DELETE' }),
  },

  // Room view endpoints
  roomViews: {
    getAll: () => api.fetch('/roomviews'),
    getById: (id: string) => api.fetch(`/roomviews/${id}`),
  },
};

export default api;
