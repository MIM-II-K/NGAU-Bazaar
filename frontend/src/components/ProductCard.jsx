import React, { useState } from 'react';
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { addToCart } from '../utils/cartApi';
import { useCart } from '../contexts/CartContext';
import { getProductImageUrl } from '../utils/urlHelper';
import { productApi } from '../utils/productApi';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = 'https://ngau-bazaar.onrender.com';
const fallbackImage = "https://via.placeholder.com/300x200?text=No+Image";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const { refreshUserStats } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(product.is_in_wishlist);

    const handleWishlistToggle = async (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login to manage wishlist");
            return;
        }

        const prevState = isWishlisted;
        setIsWishlisted(!prevState); 

        try {
            await productApi.toggleWishlist(product.id);
            if (refreshUserStats) await refreshUserStats(); 
        } catch (error) {
            setIsWishlisted(prevState); 
            console.error("Wishlist toggle error:", error);
        }
    };

    const handleCardClick = () => {
        const identifier = product.slug || product.id;
        navigate(`/products/${identifier}`);
    };

    const handleQuickAdd = async (e) => {
        e.stopPropagation();
        if (product.quantity <= 0) return;

        try {
            setLoading(true);
            await addToCart(product.id, 1);
            await refreshCart();
        } catch (error) {
            alert("Please login to add items to cart");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            whileHover={{ y: -10 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-100"
        >
            <Card className="modern-product-card h-100 border-0 shadow-sm" onClick={handleCardClick}>
                <div className="card-image-wrapper">
                    {/* Badge Stack */}
                    <div className="badge-stack">
                        {product.is_flash_deal && (
                            <Badge bg="danger" className="flash-badge">
                                <i className="bi bi-lightning-fill"></i> FLASH
                            </Badge>
                        )}
                        {product.view_count > 50 && (
                            <Badge bg="warning" className="popular-badge text-dark">
                                <i className="bi bi-fire"></i> POPULAR
                            </Badge>
                        )}
                    </div>

                    {/* Wishlist Button */}
                    <button
                        onClick={handleWishlistToggle}
                        className={`modern-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    >
                        <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </button>

                    <Card.Img
                        variant="top"
                        src={product.images?.length > 0 ? getProductImageUrl(product.images[0].url, API_BASE_URL) : fallbackImage}
                        className="main-card-img"
                        onError={(e) => { e.currentTarget.src = fallbackImage; }}
                    />

                    {/* Hover Quick View Overlay */}
                    <div className="card-hover-overlay">
                        <span className="overlay-text">VIEW DETAILS</span>
                    </div>
                </div>

                <Card.Body className="p-3 d-flex flex-column">
                    <div className="category-label text-uppercase">{product.category?.name || 'Organic'}</div>
                    <Card.Title className="modern-card-title">{product.name}</Card.Title>
                    
                    {/* Tags Section */}
                    {product.tags && (
                        <div className="modern-tag-list">
                            {(Array.isArray(product.tags) ? product.tags : product.tags.split(','))
                                .slice(0, 2).map((tag, i) => (
                                <span key={i} className="card-tag">#{tag.trim()}</span>
                            ))}
                        </div>
                    )}

                    <div className="card-footer-action mt-auto pt-3">
                        <div className="price-container">
                            {product.is_flash_deal ? (
                                <>
                                    <span className="price-old">Rs.{product.price}</span>
                                    <span className="price-new">Rs.{product.discount_price}</span>
                                </>
                            ) : (
                                <span className="price-regular">Rs.{product.price}</span>
                            )}
                        </div>

                        <Button
                            variant="primary"
                            className="modern-add-btn"
                            disabled={loading || product.quantity <= 0}
                            onClick={handleQuickAdd}
                        >
                            {loading ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <i className={product.quantity <= 0 ? "bi bi-slash-circle" : "bi bi-cart-plus"}></i>
                            )}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </motion.div>
    );
};

export default ProductCard;