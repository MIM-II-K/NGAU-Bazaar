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

// Checkout cart
export const checkoutCart = async (checkoutData) => {
  const response = await apiClient.post("/cart/checkout", checkoutData);
  return response;
};
