const API_URL = 'http://localhost:5000';

// Helper to build API URLs without double slashes
const buildUrl = (path) => {
  const baseUrl = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) 
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') // Remove trailing slash
    : API_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const api = {
  // Rooms
  async getRooms(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.checkIn) params.append('checkIn', filters.checkIn);
    if (filters.checkOut) params.append('checkOut', filters.checkOut);
    
    const url = `${buildUrl('/api/rooms')}?${params}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch rooms: ${res.status}`);
    }
    
    return res.json();
  },

  async getFeaturedRooms() {
    const url = buildUrl('/api/rooms/featured');
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch featured rooms: ${res.status}`);
    }
    
    return res.json();
  },

  async getRoom(id) {
    const url = buildUrl(`/api/rooms/${id}`);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) throw new Error('Failed to fetch room');
    return res.json();
  },

  // Bookings
  async createBooking(bookingData) {
    const res = await fetch(buildUrl('/api/bookings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to create booking');
    }
    
    return res.json();
  },

  async getBookings() {
    const res = await fetch(buildUrl('/api/bookings'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
  }
};
