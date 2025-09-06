import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((req) => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const token = JSON.parse(user).token;
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Could not parse user from localStorage", e);
    }
  }
  return req;
});

export default API;