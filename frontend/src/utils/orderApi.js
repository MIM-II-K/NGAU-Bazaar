import apiClient from './api';

export const orderApi = {
  // Get all orders for current user
  getMyOrders: () => apiClient.get('/orders/my'),

  // Get order history (with items)
  getOrderHistory: () => apiClient.get('/orders/history'),

  // Create new order (if allowed)
  create: (data) => apiClient.post('/orders/', data),

  // Pay for an order
  pay: (orderId) => apiClient.post(`/orders/${orderId}/pay`),

  // Get single order detail
  getById: (orderId) => apiClient.get(`/orders/${orderId}`),

  // Download invoice PDF (returns blob)
  downloadInvoice: (orderId) =>
    apiClient.get(`/orders/${orderId}/invoice`, { responseType: 'blob' }),

  // Admin-only: Get all orders
  getAllAdmin: () => apiClient.get('/orders/admin'),

  // Admin-only: Update order status
  updateStatus: (orderId, status) => apiClient.put(`/orders/${orderId}/status`, null, { params: { status } })
};
