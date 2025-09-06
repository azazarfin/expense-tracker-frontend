import axios from 'axios';

// Create a single, configured axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

// Use an interceptor to automatically add the authorization token to every request
API.interceptors.request.use((req) => {
  const profile = localStorage.getItem('profile'); // Changed to 'profile' to match earlier logic
  if (profile) {
    try {
      req.headers.Authorization = `Bearer ${JSON.parse(profile).token}`;
    } catch (e) {
      console.error("Could not parse profile from localStorage", e);
    }
  }
  return req;
});

// Export the configured instance as the default module export
export default API;
