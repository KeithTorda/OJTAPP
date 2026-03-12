import axios from 'axios';

// Base URL for the PHP backend API
const API_URL = import.meta.env.VITE_API_URL + '/endpoints';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.id) {
    // Add auth headers if token based auth is fully engaged
    // config.headers['Authorization'] = 'Bearer ' + user.token;
  }
  return config;
});

export default api;
