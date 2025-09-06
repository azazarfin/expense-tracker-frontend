import axios from 'axios';

// The backend's default port is 5001
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (error) {
    // Ignore error if user is not logged in or token is not available
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;