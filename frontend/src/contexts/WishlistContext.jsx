import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { productApi } from '../utils/productApi';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [loading, setLoading] = useState(false);

    // Fetch wishlist when authenticated
    const fetchWishlist = useCallback(async () => {
        if (!isAuthenticated()) {
            setWishlistIds(new Set());
            return;
        }
        try {
            const data = await productApi.getWishlist();
            const ids = data.map(item => item.product_id || item.id);
            setWishlistIds(new Set(ids));
        } catch (err) {
            console.error('Failed to fetch wishlist', err);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist, user]);

    const isInWishlist = useCallback((productId) => wishlistIds.has(productId), [wishlistIds]);

    const toggleWishlist = useCallback(async (productId) => {
        if (!isAuthenticated()) {
            // Optionally trigger a login modal or toast
            throw new Error('Please login to manage wishlist');
        }
        const prevIds = new Set(wishlistIds);
        const isCurrentlyIn = prevIds.has(productId);
        // Optimistic update
        const newIds = new Set(prevIds);
        isCurrentlyIn ? newIds.delete(productId) : newIds.add(productId);
        setWishlistIds(newIds);

        try {
            const res = await productApi.toggleWishlist(productId);
            // Ensure server state matches
            if ((res.status === 'added') === isCurrentlyIn) {
                // If server disagrees, revert
                setWishlistIds(prevIds);
            }
            return res;
        } catch (error) {
            // Revert on error
            setWishlistIds(prevIds);
            throw error;
        }
    }, [wishlistIds, isAuthenticated]);

    return (
        <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist, loading, refresh: fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
