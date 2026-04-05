import apiClient from './api';

export const productApi = {
  // ---------------- GET PRODUCTS ----------------
  getAll: (params = {}) => apiClient.get('/products/', { params }),

  // ---------------- GET PRODUCT DETAIL ----------------
  getById: (id) => apiClient.get(`/products/id/${id}`),

  getBySlug: (slug) => apiClient.get(`/products/${slug}`),

  getRelated: (productId) => apiClient.get(`/products/${productId}/related`),

  // ---------------- WISHLIST ACTIONS ----------------
  // Unified with your apiClient
  getWishlist: () => apiClient.get('/wishlist/').then(res => res.data),

  toggleWishlist: (productId) => apiClient.post(`/wishlist/toggle/${productId}`).then(res => res.data),

  // ---------------- TRACKING & ANALYTICS ----------------
  trackView: (productId) => apiClient.post(`/products/${productId}/view`),

  // ---------------- CREATE / UPDATE PRODUCTS ----------------
  create: (formData) => apiClient.post('/products/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  update: (id, formData) => apiClient.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // ---------------- DELETE PRODUCT ----------------
  delete: (id) => apiClient.delete(`/products/${id}`),

  // ---------------- GET CATEGORIES ----------------
  getCategories: () => apiClient.get('/categories/'),
};