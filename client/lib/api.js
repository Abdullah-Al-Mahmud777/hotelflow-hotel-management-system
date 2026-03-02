const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Mock data as fallback
const mockRooms = [
  {
    _id: 'mock-1',
    name: "Ocean View Deluxe",
    type: "Deluxe",
    price: 150,
    description: "Spacious deluxe room with stunning ocean views and modern amenities",
    capacity: 2,
    featured: true
  },
  {
    _id: 'mock-2',
    name: "Presidential Suite",
    type: "Suite",
    price: 450,
    description: "Luxurious presidential suite with separate living area and premium services",
    capacity: 4,
    featured: true
  },
  {
    _id: 'mock-3',
    name: "Garden Deluxe",
    type: "Deluxe",
    price: 120,
    description: "Comfortable deluxe room overlooking beautiful garden landscapes",
    capacity: 2,
    featured: true
  },
  {
    _id: 'mock-4',
    name: "Executive Suite",
    type: "Suite",
    price: 350,
    description: "Perfect for business travelers with workspace and meeting facilities",
    capacity: 3,
    featured: true
  },
  {
    _id: 'mock-5',
    name: "Honeymoon Suite",
    type: "Suite",
    price: 400,
    description: "Romantic suite with king-size bed and private terrace",
    capacity: 2,
    featured: true
  },
  {
    _id: 'mock-6',
    name: "City View Deluxe",
    type: "Deluxe",
    price: 180,
    description: "Modern deluxe room with panoramic city skyline views",
    capacity: 2,
    featured: true
  }
];

// Helper function to fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const api = {
  // Rooms
  async getRooms(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== 'all') params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.checkIn) params.append('checkIn', filters.checkIn);
      if (filters.checkOut) params.append('checkOut', filters.checkOut);
      
      const url = `${API_URL}/api/rooms?${params}`;
      
      const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }, 5000);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch rooms: ${res.status}`);
      }
      
      return res.json();
    } catch (error) {
      console.warn('Using mock data - API unavailable:', error.message);
      // Return mock data as fallback
      let filteredRooms = [...mockRooms];
      
      // Apply filters to mock data
      if (filters.type && filters.type !== 'all') {
        filteredRooms = filteredRooms.filter(room => room.type === filters.type);
      }
      if (filters.minPrice) {
        filteredRooms = filteredRooms.filter(room => room.price >= Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        filteredRooms = filteredRooms.filter(room => room.price <= Number(filters.maxPrice));
      }
      
      return { success: true, count: filteredRooms.length, data: filteredRooms };
    }
  },

  async getFeaturedRooms() {
    try {
      const url = `${API_URL}/api/rooms/featured`;
      
      const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }, 5000);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch featured rooms: ${res.status}`);
      }
      
      return res.json();
    } catch (error) {
      console.warn('Using mock data - API unavailable:', error.message);
      // Return mock data as fallback
      return { success: true, count: mockRooms.length, data: mockRooms };
    }
  },

  async getRoom(id) {
    try {
      const url = `${API_URL}/api/rooms/${id}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch room');
      return res.json();
    } catch (error) {
      console.error('getRoom error:', error);
      throw error;
    }
  },

  // Bookings
  async createBooking(bookingData) {
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create booking');
      }
      
      return res.json();
    } catch (error) {
      console.error('createBooking error:', error);
      throw error;
    }
  },

  async getBookings() {
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    } catch (error) {
      console.error('getBookings error:', error);
      throw error;
    }
  }
};
