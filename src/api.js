import axios from 'axios';

// 1. Get the backend URL from an environment variable.
//    On Vercel, this will be your Render URL.
//    On your local machine, it will fall back to localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 2. Create a central axios instance with the correct base URL.
const api = axios.create({
  baseURL: API_URL
});

// 3. (Important!) This "interceptor" acts like a gatekeeper.
//    It automatically adds the login token to EVERY request
//    so you don't have to do it in every component.
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