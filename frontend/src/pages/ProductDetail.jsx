import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { productApi } from '../utils/productApi';
import { addToCart } from '../utils/cartApi';
import { getProductImageUrl } from '../utils/urlHelper';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import AOS from 'aos';
import ToastMessage from '../components/ToastMessage';
import ProductCard from '../components/ProductCard';
import '../styles/product-detail.css';

const API_BASE_URL = "https://ngau-bazaar.onrender.com";
const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { refreshCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const data = await productApi.getBySlug(slug);

            if (!data || Object.keys(data).length === 0) {
                navigate('/shop');
                return;
            }

            // Set product with proper stock field
            setProduct({ ...data, stock: data.quantity || data.stock || 0 });
            setActiveImage(0);

            // Fetch related products using the product ID
            if (data.id) {
                try {
                    // Use the dedicated related products endpoint
                    const relatedData = await productApi.getRelated(data.id);

                    // Handle the response - getRelated returns an array directly
                    let relatedArray = [];
                    if (Array.isArray(relatedData)) {
                        relatedArray = relatedData;
                    } else if (relatedData && relatedData.data && Array.isArray(relatedData.data)) {
                        relatedArray = relatedData.data;
                    } else if (relatedData && typeof relatedData === 'object') {
                        // If it's a single product object
                        relatedArray = [relatedData];
                    }

                    // Filter out current product and limit to 4
                    const filtered = relatedArray
                        .filter(item => item.slug !== slug)
                        .slice(0, 4);

                    setRelatedProducts(filtered);
                } catch (relatedError) {
                    console.error("Error fetching related products:", relatedError);

                    // Fallback: Fetch by category
                    if (data.category_id || data.category?.id) {
                        const categoryId = data.category_id || data.category.id;
                        const categoryResponse = await productApi.getAll({
                            category: categoryId,
                            limit: 10
                        });

                        // Extract the data array from the response
                        const categoryProducts = categoryResponse.data || categoryResponse;

                        if (Array.isArray(categoryProducts)) {
                            const filtered = categoryProducts
                                .filter(item => item.slug !== slug)
                                .slice(0, 4);
                            setRelatedProducts(filtered);
                        } else {
                            setRelatedProducts([]);
                        }
                    }
                }
            }

        } catch (error) {
            console.error("API Error:", error);
            navigate('/shop');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
        if (slug) {
            setProduct(null);
            setRelatedProducts([]);
            setLoading(true);
            setActiveImage(0);
            fetchProduct();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [slug]);

    const handleAddToCart = async () => {
        if (quantity > product.stock) {
            setToastMessage(`Cannot add more than ${product.stock} units of ${product.name}`);
            setShowToast(true);
            return;
        }

        setIsAdding(true);

        try {
            await addToCart(product.id, quantity);
            await refreshCart();

            setProduct(prev => ({
                ...prev,
                stock: prev.stock - quantity
            }));

            setToastMessage(`Added ${quantity} x ${product.name} to cart!`);
            setShowToast(true);
        } catch (error) {
            console.error("Cart API error:", error);

            try {
                const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                const existingItem = guestCart.find(item => item.productId === product.id);

                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    guestCart.push({
                        productId: product.id,
                        quantity: quantity,
                        product: {
                            id: product.id,
                            name: product.name,
                            price: product.discount_price || product.price,
                            image: product.images?.[0]?.url,
                            stock: product.stock
                        }
                    });
                }

                localStorage.setItem('guestCart', JSON.stringify(guestCart));

                setProduct(prev => ({
                    ...prev,
                    stock: prev.stock - quantity
                }));

                setToastMessage(`Added ${quantity} x ${product.name} to guest cart! Login to save permanently.`);
                setShowToast(true);
            } catch (localError) {
                setToastMessage("Failed to add to cart. Please try again.");
                setShowToast(true);
            }
        } finally {
            setIsAdding(false);
        }
    };

    // Derived wishlist state using context
    const isProductWishlisted = product ? isInWishlist(product.id) : false;

    const handleWishlistToggle = async () => {
        if (!isAuthenticated()) {
            setToastMessage("Please login to manage your wishlist.");
            setShowToast(true);
            return;
        }

        setIsWishlistLoading(true);
        try {
            await toggleWishlist(product.id);
            setToastMessage(isProductWishlisted ? "Removed from wishlist." : "Added to wishlist!");
            setShowToast(true);
        } catch (error) {
            setToastMessage("Failed to update wishlist. Please try again.");
            setShowToast(true);
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleImageZoom = (e) => {
        if (!isZoomed) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    const getDiscountPercentage = () => {
        if (product.is_flash_deal && product.discount_price) {
            return Math.round(((product.price - product.discount_price) / product.price) * 100);
        }
        return 0;
    };

    if (loading) return (
        <div className="product-detail-wrapper py-5">
            <Container>
                <Row>
                    <Col lg={6}>
                        <div className="skeleton-image shimmer"></div>
                    </Col>
                    <Col lg={6}>
                        <div className="skeleton-info">
                            <div className="skeleton-title shimmer"></div>
                            <div className="skeleton-price shimmer"></div>
                            <div className="skeleton-description shimmer"></div>
                            <div className="skeleton-button shimmer"></div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );

    if (!product) return null;

    const discountPercentage = getDiscountPercentage();
    const isLowStock = product.stock > 0 && product.stock <= 10;
    const isOutOfStock = product.stock <= 0;

    const structuredData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images?.map(img => getProductImageUrl(img.url, API_BASE_URL)),
        "description": product.description,
        "brand": { "@type": "Brand", "name": "NGAU Bazaar" },
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "NPR",
            "price": product.discount_price || product.price,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
    };

    return (
        <motion.div
            className="product-detail-wrapper py-5"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <Helmet>
                <title>{`${product.name} - Fresh Organic | NGAU Bazaar`}</title>
                <meta name="description" content={product.description?.substring(0, 160)} />
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            </Helmet>

            <Container>
                {/* Modern Breadcrumb */}
                <motion.div variants={itemVariants} className="modern-breadcrumb mb-4">
                    <nav aria-label="breadcrumb">
                        <ol className="modern-breadcrumb-list">
                            <li className="breadcrumb-item">
                                <a onClick={() => navigate("/")} className="breadcrumb-link">
                                    <i className="bi bi-house-door-fill me-1"></i>
                                    Home
                                </a>
                            </li>
                            <li className="breadcrumb-separator">
                                <i className="bi bi-chevron-right"></i>
                            </li>
                            <li className="breadcrumb-item">
                                <a onClick={() => navigate("/shop")} className="breadcrumb-link">
                                    <i className="bi bi-grid-3x3-gap-fill me-1"></i>
                                    Shop
                                </a>
                            </li>
                            <li className="breadcrumb-separator">
                                <i className="bi bi-chevron-right"></i>
                            </li>
                            <li className="breadcrumb-item active">
                                <span className="breadcrumb-current">
                                    <i className="bi bi-tag-fill me-1"></i>
                                    {product?.name?.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                                </span>
                            </li>
                        </ol>
                    </nav>
                </motion.div>

                <Row className="gx-lg-5 align-items-start">
                    {/* Image Gallery Section */}
                    <Col lg={6} data-aos="zoom-in">
                        <motion.div
                            className="detail-image-card shadow-lg overflow-hidden rounded-4 position-relative mb-3"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div
                                className={`main-image-container ${isZoomed ? 'zoomed' : ''}`}
                                onMouseMove={handleImageZoom}
                                onMouseEnter={() => setIsZoomed(true)}
                                onMouseLeave={() => setIsZoomed(false)}
                                style={{
                                    height: '500px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#fff',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: isZoomed ? 'zoom-out' : 'zoom-in'
                                }}
                            >
                                <img
                                    src={
                                        product.images && product.images.length > 0
                                            ? getProductImageUrl(product.images[activeImage].url, API_BASE_URL)
                                            : fallbackImage
                                    }
                                    alt={product.name}
                                    style={{
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        objectFit: 'contain',
                                        transform: isZoomed ? 'scale(2)' : 'scale(1)',
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onError={(e) => { e.currentTarget.src = fallbackImage; }}
                                />

                                {/* Stock Badge - Top Right */}
                                <div className="stock-badge-top-right">
                                    {!isOutOfStock ? (
                                        <Badge
                                            bg={isLowStock ? "warning" : "success"}
                                            className={`stock-badge ${isLowStock ? 'low-stock' : 'in-stock'}`}
                                        >
                                            <i className={`bi bi-${isLowStock ? 'exclamation-triangle' : 'check-circle-fill'} me-1`}></i>
                                            {product.stock} in stock
                                        </Badge>
                                    ) : (
                                        <Badge bg="danger" className="stock-badge out-of-stock">
                                            <i className="bi bi-x-circle-fill me-1"></i>
                                            Out of Stock
                                        </Badge>
                                    )}
                                </div>

                                {/* Flash Deal Badge */}
                                {product.is_flash_deal && (
                                    <motion.div
                                        className="flash-deal-badge"
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <i className="bi bi-lightning-charge-fill me-2"></i>
                                        FLASH SALE
                                        {discountPercentage > 0 && (
                                            <span className="discount-percent ms-2">-{discountPercentage}%</span>
                                        )}
                                    </motion.div>
                                )}

                                {/* Low Stock Warning */}
                                {isLowStock && !isOutOfStock && (
                                    <motion.div
                                        className="low-stock-warning"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <i className="bi bi-hourglass-split"></i>
                                        Only {product.stock} left! Hurry!
                                    </motion.div>
                                )}
                            </div>

                            {/* Thumbnail Gallery */}
                            {product.images && product.images.length > 1 && (
                                <motion.div
                                    className="d-flex gap-2 overflow-auto pb-2 custom-scrollbar mt-3"
                                    variants={itemVariants}
                                >
                                    {product.images.map((img, index) => (
                                        <motion.div
                                            key={index}
                                            className={`thumbnail-item rounded-3 border ${activeImage === index ? 'border-primary border-2 active' : ''}`}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                cursor: 'pointer',
                                                overflow: 'hidden',
                                                flexShrink: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#fff'
                                            }}
                                            onClick={() => setActiveImage(index)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <img
                                                src={getProductImageUrl(img.url, API_BASE_URL)}
                                                alt={`${product.name} thumbnail ${index}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.currentTarget.src = fallbackImage; }}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    </Col>

                    {/* Product Info Section */}
                    <Col lg={6} className="mt-5 mt-lg-0" data-aos="fade-left">
                        <motion.div variants={itemVariants}>
                            <Badge bg="soft-primary" className="text-primary mb-3 px-3 py-2 category-badge">
                                {product.category?.name || product.category_name || 'Premium Collection'}
                            </Badge>

                            <h1 className="display-5 fw-bold mb-3">{product.name}</h1>

                            {/* Price Section */}
                            <div className="price-section mb-4">
                                {product.is_flash_deal ? (
                                    <>
                                        <div className="d-flex align-items-center gap-3 flex-wrap">
                                            <h2 className="text-danger fw-bold display-6 mb-0">
                                                Rs.{product.discount_price}
                                            </h2>
                                            <Badge bg="danger" className="fs-6 px-3 py-2">
                                                {discountPercentage}% OFF
                                            </Badge>
                                        </div>
                                        <div className="text-muted text-decoration-line-through fs-5 mt-2">
                                            <span className="fw-normal">Original: Rs.{product.price}</span>
                                            <span className="text-muted ms-2">/ {product.unit || 'item'}</span>
                                        </div>
                                        <div className="mt-2">
                                            <Badge bg="soft-danger" className="text-danger border border-danger px-3 py-2">
                                                <i className="bi bi-piggy-bank me-1"></i>
                                                Save Rs.{product.price - product.discount_price}
                                            </Badge>
                                        </div>
                                    </>
                                ) : (
                                    <div className="d-flex align-items-baseline gap-2 flex-wrap">
                                        <h2 className="text-primary fw-bold display-6 mb-0">
                                            Rs.{product.price}
                                        </h2>
                                        <span
                                            className="text-muted fs-5 fw-normal"
                                            style={{ textTransform: 'lowercase' }} // This forces the browser to render it lowercase
                                        >
                                            / {(product.unit?.trim() || 'pc').toLowerCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Tags Section */}
                            {product.tags && (
                                <motion.div className="mb-4" variants={itemVariants}>
                                    <div className="d-flex flex-wrap gap-2">
                                        {(Array.isArray(product.tags)
                                            ? product.tags
                                            : product.tags.split(',')
                                        ).map((tag, index) => (
                                            <motion.div
                                                key={index}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Badge
                                                    bg="light"
                                                    className="text-secondary border px-3 py-2 rounded-pill fw-normal shadow-sm tag-pill"
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => navigate(`/shop?search=${tag.trim()}`)}
                                                >
                                                    #{tag.trim()}
                                                </Badge>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Description */}
                            <p className="lead text-muted mb-4 product-description">
                                {product.description || "This premium product is crafted with the highest quality materials."}
                            </p>

                            {/* Stock Info */}
                            <div className="stock-info mb-4">
                                <div className="d-flex align-items-center gap-2">
                                    {!isOutOfStock ? (
                                        <>
                                            <i className={`bi ${isLowStock ? 'bi-exclamation-triangle-fill text-warning' : 'bi-check-circle-fill text-success'}`}></i>
                                            <span className="fw-semibold">
                                                {isLowStock ? 'Limited Stock' : 'In Stock'}
                                            </span>
                                            <span className="text-dark fw-bold">
                                                {product.stock} {product.stock === 1 ? 'unit' : 'units'}
                                            </span>
                                            <span className="text-muted small">available</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-x-circle-fill text-danger"></i>
                                            <span className="fw-semibold text-danger">Out of Stock</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Quantity Selector & Actions */}
                            <div className="actions-section">
                                {!isOutOfStock && (
                                    <div className="quantity-selector-wrapper mb-4">
                                        <div className="quantity-selector d-inline-flex align-items-center border rounded-3 p-1">
                                            <Button
                                                variant="link"
                                                className="text-dark p-2 text-decoration-none"
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                disabled={quantity <= 1}
                                            >
                                                <i className="bi bi-dash-lg"></i>
                                            </Button>
                                            <span className="px-4 fw-bold">{quantity}</span>
                                            <Button
                                                variant="link"
                                                className="text-dark p-2 text-decoration-none"
                                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                                disabled={quantity >= product.stock}
                                            >
                                                <i className="bi bi-plus-lg"></i>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="action-buttons-wrapper">
                                    {/* Full Width Add to Cart Button */}
                                    <button
                                        className="add-to-cart-btn-full"
                                        onClick={handleAddToCart}
                                        disabled={isAdding || isOutOfStock}
                                    >
                                        {isAdding ? (
                                            <>
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-cart-plus-fill me-2"></i>
                                                Add to Cart
                                            </>
                                        )}
                                    </button>

                                    {/* Heart Only Wishlist Button - FIXED to use context state */}
                                    <button
                                        className={`wishlist-heart-btn ${isProductWishlisted ? 'active' : ''}`}
                                        onClick={handleWishlistToggle}
                                        disabled={isWishlistLoading}
                                        aria-label="Add to wishlist"
                                    >
                                        {isWishlistLoading ? (
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        ) : (
                                            <i className={`bi bi-heart${isProductWishlisted ? '-fill' : ''}`}></i>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <motion.div className="trust-badges mt-4 pt-3" variants={itemVariants}>
                                <div className="trust-badge">
                                    <i className="bi bi-shield-check"></i>
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="trust-badge">
                                    <i className="bi bi-truck"></i>
                                    <span>Fast Delivery</span>
                                </div>
                                <div className="trust-badge">
                                    <i className="bi bi-arrow-repeat"></i>
                                    <span>Easy Returns</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </Col>
                </Row>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <motion.div
                        className="related-products-section mt-5 pt-5"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <hr className="mb-5 opacity-10" />
                        <div className="section-header text-center mb-4">
                            <h3 className="fw-bold">You May Also Like</h3>
                            <p className="text-muted">Discover more premium products</p>
                        </div>
                        <Row className="g-4">
                            {relatedProducts.map((item, index) => (
                                <Col key={item.id} xs={12} sm={6} md={4} lg={3}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <ProductCard product={item} />
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>
                    </motion.div>
                )}

                <ToastMessage
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    message={toastMessage}
                    title="Cart"
                />
            </Container>
        </motion.div>
    );
};

export default ProductDetail;