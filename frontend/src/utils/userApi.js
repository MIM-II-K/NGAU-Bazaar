import { data } from 'react-router-dom';
import apiClient from './api';

export const userApi = {
  // Get current logged-in user's profile
  getMe: () => apiClient.get('/users/me'),

  // Get any user by ID (admin only)
  getById: (id) => apiClient.get(`/users/${id}`),

  // Get all users (admin only)
  getAll: () => apiClient.get('/users/all'),

  // Register a new user
  register: (data) => apiClient.post('/users/register', data),

  // Login user
  login: (credentials) => apiClient.post('/users/login', credentials),

  updateProfile: (data) => apiClient.put('/users/me', data),

  forgotPassword: (email) => apiClient.post('/users/forgot-password', { email }),

  resetPassword: (data) => apiClient.post('/users/reset-password', data),
  
  sendOtp: (phone_number)=> apiClient.post('/otp/send', {phone_number}),

  verifyOtp: (data) => apiClient.post('/otp/verify', data),

};
