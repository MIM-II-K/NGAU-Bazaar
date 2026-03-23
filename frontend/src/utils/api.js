import axios from 'axios';

const API_BASE_URL = "https://ngau\-bazaar.onrender.com";

/**
 * Create an Axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches the JWT token to every outgoing request if it exists.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Globally handles common errors like 401 (Unauthorized) and 403 (Forbidden).
 */
apiClient.interceptors.response.use(
  (response) => response.data, // Directly return the data part of the response
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    } else if (status === 403) {
      console.error('Access Denied: You do not have permission for this action.');
    }

    // Extract the error message from the backend 'detail' field or use default
    const errorMessage = error.response?.data?.detail || error.message || 'Network Error';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;