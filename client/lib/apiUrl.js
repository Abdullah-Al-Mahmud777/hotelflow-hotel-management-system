// Helper to build API URLs without double slashes
export const getApiUrl = (path = '') => {
  const baseUrl = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) 
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') // Remove trailing slash
    : 'http://localhost:5000';
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};
