import axios from 'axios';

// Create an axios instance configured for our Node.js backend API
const api = axios.create({
  // Base URL for the Natours API endpoints (environment-specific)
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1`,
  // Allow sending cookies (JWT) with requests
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
