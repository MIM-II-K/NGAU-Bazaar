import React, { useState } from 'react';
import { Card, Badge, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../utils/cartApi';
import { useCart } from '../contexts/CartContext';
// 1. IMPORT THE HELPER
import { getProductImageUrl } from '../utils/urlHelper'; 

const API_BASE_URL = 'https://ngau-bazaar.onrender.com';
const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%2394a3b8'%3ENo Image%3C/text%3E%3C/svg%3E";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const [loading, setLoading] = useState(false);

    const handleCardClick = () => {
        navigate(`/products/${product.slug}`);
    };

    const handleQuickAdd = async (e) => {
        e.stopPropagation();
        if (product.quantity <= 0) return;

        try {
            setLoading(true);
            await addToCart(product.id, 1);
            await refreshCart();
        } catch (error) {
            console.error("Quick add error:", error);
            alert("Please login to add items to cart");
        } finally {
            setLoading(false);
        }
    };

    const renderTags = () => {
        if (!product.tags) return null;
        let tagArray = Array.isArray(product.tags) ? product.tags : product.tags.split(',').map(t => t.trim());
        return (
            <div className="d-flex flex-wrap gap-1 mb-3">
                {tagArray.slice(0, 3).map((tag, i) => (
                    <span key={i} className="tag-pill py-0 px-2" style={{ fontSize: '0.7rem' }}>#{tag}</span>
                ))}
            </div>
        );
    };

    return (
        <Card className="product-card h-100 shadow-sm border-0" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="product-img-container" style={{ height: '200px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                <img
                    // 2. USE THE HELPER HERE
                    src={
                        product.images && product.images.length > 0 
                        ? getProductImageUrl(product.images[0].url, API_BASE_URL) 
                        : fallbackImage
                    }
                    alt={product.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} // Cinematic fit
                    onError={(e) => { e.currentTarget.src = fallbackImage; }}
                />
                
                {/* Overlay and Badges */}
                <div className="product-overlay">
                    <Button variant="light" className="rounded-pill px-4 fw-bold shadow-sm">
                        View Details
                    </Button>
                </div>
                
                {product.is_flash_deal && product.discount_price && (
                    <Badge bg="danger" className="position-absolute top-0 end-0 m-2">
                        {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                    </Badge>
                )}
                
                {product.view_count > 50 && (
                    <Badge bg="warning" className="position-absolute top-0 start-0 m-2 text-dark shadow-sm">
                        <i className="bi bi-fire me-1"></i> Popular
                    </Badge>
                )}
            </div>

            <Card.Body className="d-flex flex-column">
                <span className="text-primary small fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem' }}>
                    {product.category?.name || 'New Arrival'}
                </span>

                <Card.Title className="product-title mb-2 text-dark fw-bold" style={{ fontSize: '1rem' }}>
                    {product.name}
                </Card.Title>

                {renderTags()}

                <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
                    <div>
                        {product.is_flash_deal ? (
                            <div className="d-flex flex-column">
                                <span className="text-decoration-line-through text-muted" style={{ fontSize: '0.75rem' }}>Rs.{product.price}</span>
                                <span className="product-price text-danger fw-bold">Rs.{product.discount_price}</span>
                            </div>
                        ) : (
                            <span className="product-price fw-bold text-dark">Rs.{product.price}</span>
                        )}
                    </div>
                    
                    <Button 
                        variant="soft-primary" 
                        className="btn-add-cart rounded-circle p-2"
                        disabled={loading || product.quantity <= 0}
                        onClick={handleQuickAdd}
                    >
                        {loading ? (
                            <Spinner animation="border" size="sm" />
                        ) : (
                            <i className={product.quantity <= 0 ? "bi bi-x-circle" : "bi bi-cart-plus"}></i>
                        )}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
};

export default ProductCard;