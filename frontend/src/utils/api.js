import axios from 'axios';

// Ensure this matches your Render URL exactly
const API_BASE_URL = "https://ngau-bazaar.onrender.com";

/**
 * Create an Axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15-second timeout to prevent infinite "hanging" connections
});

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches the JWT token and handles dynamic headers
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // 1. Handle Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Let Axios handle Content-Type automatically
    // Removing the manual 'application/json' set helps prevent CORS preflight issues
    // Axios will automatically set the correct boundary for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 * Globally handles errors and data extraction
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return only the data part to keep components clean
    return response.data;
  },
  (error) => {
    // If the server process crashed (ERR_CONNECTION_CLOSED), error.response will be undefined
    if (!error.response) {
      console.error("Network Error: The server might be down or crashing.");
      return Promise.reject(new Error("Server connection lost. Please try again later."));
    }

    const status = error.response.status;

    if (status === 401) {
      // Token is invalid or expired - Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if the user isn't already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true';
      }
    } 
    
    if (status === 403) {
      console.error('Access Denied: You do not have permission for this action.');
    }

    if (status === 404) {
      console.error('Resource not found: Check if the API route includes /api/ or trailing slashes.');
    }

    // Extract the exact error message from FastAPI's 'detail' field
    const errorMessage = error.response?.data?.detail || "Something went wrong";
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;