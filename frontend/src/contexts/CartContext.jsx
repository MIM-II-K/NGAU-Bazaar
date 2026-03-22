import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart } from '../utils/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const refreshCart = useCallback(async () => {
    if (isAuthenticated()) {
      try {
        const res = await getCart();
        // Count unique products in the array
        const totalUniqueProducts = res.items?.length || 0;
        setCartCount(totalUniqueProducts);
      } catch (err) {
        console.error("Cart Sync Error:", err);
        setCartCount(0);
      }
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  // FIX: Listen for 'cartUpdated' event to prevent hard refreshes
  useEffect(() => {
    window.addEventListener('cartUpdated', refreshCart);
    return () => window.removeEventListener('cartUpdated', refreshCart);
  }, [refreshCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);