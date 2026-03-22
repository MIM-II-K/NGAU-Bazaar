import apiClient from "./api";

export const adminApi = {
  // ---------------- PRODUCTS CRUD ----------------
  // Change this line in adminApi.js
  getProducts: (params = {}) => {
    return apiClient.get("/products/", {
      params: {
        page: params.page || 1,
        limit: params.limit || 12, // match your backend's default
      },
    });
  }, // Returns all products with category_name and description

  createProduct: (formData) =>
    apiClient.post("/products/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateProduct: (id, formData) =>
    apiClient.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteProduct: (id) => apiClient.delete(`/products/${id}`),

  // ---------------- ORDERS CRUD ----------------
  // Get all orders (Admin) with optional pagination and status filter
  getAllOrders: (page = 1, limit = 50, status) => {
    const params = { page, limit };
    if (status !== undefined && status !== "") params.status = status; // optional status filter
    return apiClient.get("/orders/admin", { params });
  },

  // Update order status (Admin)
  updateOrderStatus: (id, status) =>
    apiClient.put(`/orders/${id}/status`, null, {
      params: { status },
    }),

  // ---------------- USERS CRUD ----------------
  getAllUsers: () => apiClient.get("/users/all"), // Ensure this exists in your backend
  deleteUser: (id) => apiClient.delete(`/api/admin/users/${id}`),

  // ---------------- CATEGORIES ----------------
  getCategories: () => apiClient.get("/categories/"),
};
