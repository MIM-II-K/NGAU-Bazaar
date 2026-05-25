import apiClient from "./api";

// Fetch current user's cart
export const getCart = () => apiClient.get("/cart");

// Add product to cart
export const addToCart = (product_id, quantity) =>
  apiClient.post("/cart/add", { product_id, quantity });

// Update cart item quantity
export const updateCart = (product_id, quantity) =>
  apiClient.put("/cart/update", { product_id, quantity });

// Remove item from cart
export const removeFromCart = (product_id) =>
  apiClient.delete(`/cart/remove/${product_id}`);

// Bulk add items to cart
export const bulkAddToCart = (items) => 
  apiClient.post("/cart/bulk-add",  items );

// Checkout cart
export const checkoutCart = async (checkoutData) => {
  const response = await apiClient.post("/cart/checkout", checkoutData);
  return response;
};
