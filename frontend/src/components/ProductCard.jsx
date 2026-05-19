import React, { useState } from 'react';
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { addToCart } from '../utils/cartApi';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext'; // <-- Import Context
import { useAuth } from '../contexts/AuthContext';
import { getProductImageUrl } from '../utils/urlHelper';
import '../styles/product-card.css';

const API_BASE_URL = 'https://ngau-bazaar.onrender.com';
const fallbackImage = "https://via.placeholder.com/300x200?text=No+Image";

const ProductCard = ({ product, onWishlistToggle }) => { // <-- Accept optional callback
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const { refreshUserStats } = useAuth();
    const { isInWishlist, toggleWishlist } = useWishlist(); // <-- Consume hook

    const [loading, setLoading] = useState(false);
    const [isHoveringWishlist, setIsHoveringWishlist] = useState(false);

    // Read the truth directly from the global context
    const isWishlisted = isInWishlist(product.id);

    const handleWishlistToggle = async (e) => {
        e.stopPropagation();
        
        try {
            // central logic handles optimization, error catching, and login checking
            await toggleWishlist(product.id);
            
            if (refreshUserStats) await refreshUserStats();
            
            // If explicit handling is needed (like un-mounting inside the Wishlist Page)
            if (onWishlistToggle) {
                onWishlistToggle(product.id);
            }
        } catch (error) {
            console.error("Wishlist toggle error:", error.message);
            alert(error.message || "Something went wrong managing your wishlist.");
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
                    <div className="badge-stack">
                        {product.is_flash_deal && product.price > 0 && (
                            <Badge bg="danger" className="discount-badge">
                                {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
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
                        onMouseEnter={() => setIsHoveringWishlist(true)}
                        onMouseLeave={() => setIsHoveringWishlist(false)}
                    >
                        <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                    </button>

                    <Card.Img
                        variant="top"
                        src={product.images?.length > 0 ? getProductImageUrl(product.images[0].url, API_BASE_URL) : fallbackImage}
                        className="main-card-img"
                        onError={(e) => { e.currentTarget.src = fallbackImage; }}
                    />

                    <div className="card-hover-overlay"
                        style={{
                            opacity: isHoveringWishlist ? 0 : undefined,
                            visibility: isHoveringWishlist ? 'hidden' : 'visible',
                            transition: 'all 0.2s ease'
                        }}>
                        <button className="overlay-btn">
                            View Details
                        </button>
                    </div>
                </div>

                <Card.Body className="p-3 d-flex flex-column">
                    <div className="category-label text-uppercase">{product.category?.name || 'Organic'}</div>
                    <Card.Title className="modern-card-title">{product.name}</Card.Title>

                    {product.tags && (() => {
                        const tags = Array.isArray(product.tags) ? product.tags : product.tags.split(',');
                        const visibleTags = tags.slice(0, 2);
                        const extraCount = tags.length - visibleTags.length;

                        return (
                            <div className="modern-tag-list">
                                {visibleTags.map((tag, i) => (
                                    <span key={i} className="card-tag">
                                        #{tag.trim()}
                                    </span>
                                ))}
                                {extraCount > 0 && (
                                    <span className="card-tag tag-more">
                                        +{extraCount} more
                                    </span>
                                )}
                            </div>
                        );
                    })()}

                    <div className="card-footer-action mt-auto pt-3">
                        <div className="price-container">
                            {product.is_flash_deal ? (
                                <>
                                    <span className="price-old">Rs.{product.price}</span>
                                    <span className="price-new">
                                        Rs.{product.discount_price}
                                        <span className="unit-text"> / {product.unit}</span>
                                    </span>
                                </>
                            ) : (
                                <span className="price-regular">
                                    Rs.{product.price}
                                    <span className="unit-text"> / {product.unit}</span>
                                </span>
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