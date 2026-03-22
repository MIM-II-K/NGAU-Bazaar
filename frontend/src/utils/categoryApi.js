import apiClient from './api';

export const categoryApi = {
  /**
   * Get all categories (Public)
   */
  getAll: () => apiClient.get('/categories/'),

  /**
   * Get single category by ID (optional – future proof)
   */
  getById: (id) => apiClient.get(`/categories/${id}`),

  /**
   * Create new category (Admin only)
   * @param {{ name: string }} data
   */
  create: (data) => apiClient.post('/categories/', data),

  /**
   * Update category (Admin only – optional)
   * @param {number} id
   * @param {{ name: string }} data
   */
  update: (id, data) => apiClient.put(`/categories/${id}`, data),

  /**
   * Delete category (Admin only – optional)
   */
  delete: (id) => apiClient.delete(`/categories/${id}`)
};
