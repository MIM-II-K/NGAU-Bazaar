import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Spinner, Breadcrumb } from 'react-bootstrap';
import { productApi } from '../utils/productApi';
import { addToCart } from '../utils/cartApi';
import { getProductImageUrl } from '../utils/urlHelper';
import { useCart } from '../contexts/CartContext';
import AOS from 'aos';
import ToastMessage from '../components/ToastMessage';
import ProductCard from '../components/ProductCard'; // Added Import
import '../styles/products.css';

const API_BASE_URL = "https://ngau-bazaar.onrender.com";
const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

const ProductDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { refreshCart } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]); // Added related products state
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const fetchProduct = async () => {
        try {
            setLoading(true);

            // FIX: Use the new getBySlug method to fetch specifically by the URL slug
            const data = await productApi.getBySlug(slug);

            console.log("Fetched product data:", data);

            if (!data || Object.keys(data).length === 0) {
                console.error("Product not found for slug:", slug);
                navigate('/shop');
                return;
            }

            // Sync product data to state
            setProduct({ ...data, stock: data.quantity });
            setActiveImage(0);

            // Fetch related products based on category
            if (data.category_id || data.category?.id) {
                const categoryId = data.category_id || data.category.id;
                const relatedData = await productApi.getAll({ category: categoryId });
                // Filter out current product and limit to 4
                setRelatedProducts(relatedData.filter(item => item.slug !== slug).slice(0, 4));
            }

        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            // If the slug doesn't exist in DB, backend returns 404, we redirect
            navigate('/shop');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        AOS.init({ duration: 800, once: true });
        if (slug) {
            fetchProduct();
        }
        window.scrollTo(0, 0); // Ensure page scrolls to top on product change
    }, [slug]);


    const handleAddToCart = async () => {
        if (quantity > product.stock) {
            setToastMessage(`Cannot add more than ${product.stock} units of ${product.name}`);
            setShowToast(true);
            return;
        }

        try {
            setIsAdding(true);
            await addToCart(product.id, quantity);
            refreshCart();

            setProduct(prev => ({
                ...prev,
                stock: prev.stock - quantity
            }));

            setToastMessage(`Added ${quantity} x ${product.name} to cart!`);
            setShowToast(true);
        } catch (error) {
            console.error("Cart error:", error);
            setToastMessage("Failed to add to cart. Please ensure you are logged in.");
            setShowToast(true);
        } finally {
            setIsAdding(false);
        }
    };

    const handleBuyNow = async () => {
        // 1. Validate Stock
        if (product.stock <= 0) return;

        try {
            setIsAdding(true);
            // 2. Add to cart (same as handleAddToCart but usually 1 unit or current quantity)
            await addToCart(product.id, quantity);

            // 3. Refresh context so the navbar/sidebar updates
            await refreshCart();

            // 4. Redirect directly to checkout
            navigate('/checkout');
        } catch (error) {
            console.error("Buy Now error:", error);
            setToastMessage("Please login to proceed with Buy Now.");
            setShowToast(true);
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <Spinner animation="grow" variant="primary" />
        </div>
    );

    if (!product) return null;

    return (
        <div className="product-detail-wrapper py-5">
            <Container>
                <div className="product-breadcrumb-wrapper">
                    <Breadcrumb className="product-breadcrumb">
                        <Breadcrumb.Item onClick={() => navigate("/")}>
                            Home
                        </Breadcrumb.Item>

                        <Breadcrumb.Item onClick={() => navigate("/shop")}>
                            Shop
                        </Breadcrumb.Item>

                        <Breadcrumb.Item active>
                            {product?.name}
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>

                <Row className="gx-lg-5 align-items-center">
                    <Col lg={6} data-aos="zoom-in">
                        <div className="detail-image-card shadow-lg overflow-hidden rounded-4 position-relative mb-3">
                            <img
                                src={
                                    product.images && product.images.length > 0
                                        ? getProductImageUrl(product.images[activeImage].url, API_BASE_URL)
                                        : fallbackImage
                                }
                                alt={product.name}
                                onError={(e) => { e.currentTarget.src = fallbackImage; }}
                            />
                            {product.is_flash_deal && (
                                <Badge bg="danger" className="position-absolute top-0 start-0 m-4 py-2 px-3 shadow fs-6">
                                    <i className="bi bi-lightning-charge-fill me-2"></i>FLASH DEAL ACTIVE
                                </Badge>
                            )}
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="d-flex gap-2 overflow-auto pb-2 custom-scrollbar">
                                {product.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`thumbnail-item rounded-3 border ${activeImage === index ? 'border-primary border-2' : ''}`}
                                        style={{ width: '80px', height: '80px', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}
                                        onClick={() => setActiveImage(index)}
                                    >
                                        <img
                                            src={
                                                product.images && product.images.length > 0
                                                    ? getProductImageUrl(product.images[activeImage].url, API_BASE_URL)
                                                    : fallbackImage
                                            }
                                            alt={product.name}
                                            onError={(e) => { e.currentTarget.src = fallbackImage; }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Col>

                    <Col lg={6} className="mt-5 mt-lg-0" data-aos="fade-left">
                        <Badge bg="soft-primary" className="text-primary mb-3 px-3 py-2">
                            {product.category?.name || product.category_name || 'Premium Collection'}
                        </Badge>
                        <h1 className="display-4 fw-bold mb-3">{product.name}</h1>
                        <div className="mb-4">
                            {product.is_flash_deal ? (
                                <>
                                    <div className="text-muted text-decoration-line-through fs-5 mb-0">
                                        Original Price: Rs.{product.price}
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <h2 className="text-danger fw-bold display-6 mb-0">
                                            Rs.{product.discount_price}
                                        </h2>
                                        <Badge bg="danger" className="fs-6">
                                            {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                                        </Badge>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-muted fs-5 fw-normal"> per {product.unit || 'item'}</span>
                                        <Badge bg="soft-danger" className="ms-2 text-danger border border-danger">
                                            Save Rs.{product.price - product.discount_price}
                                        </Badge>
                                    </div>
                                </>
                            ) : (
                                <h2 className="text-primary fw-bold display-6">
                                    Rs.{product.price}
                                    <span className="text-muted fs-5 fw-normal"> / {product.unit || 'pc'}</span>
                                </h2>
                            )}
                        </div>

                        {/* --- NEW: TAGS SECTION --- */}
                        {product.tags && (
                            <div className="mb-5 d-flex flex-wrap gap-2 align-items-center" data-aos="fade-up" data-aos-delay="100">
                                <span className="text-muted small fw-bold text-uppercase me-2">
                                </span>
                                {(Array.isArray(product.tags)
                                    ? product.tags
                                    : product.tags.split(',')
                                ).map((tag, index) => (
                                    <Badge
                                        key={index}
                                        bg="light"
                                        className="text-secondary border px-3 py-2 rounded-pill fw-normal shadow-sm tag-hover-effect"
                                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                                        onClick={() => navigate(`/shop?search=${tag.trim()}`)}
                                    >
                                        #{tag.trim()}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <p className="lead text-muted mb-4">
                            {product.description || "This premium product is crafted with the highest quality materials."}
                        </p>

                        <div className="d-flex align-items-center gap-4 mb-5">
                            <div className="quantity-selector d-flex align-items-center border rounded-3 p-1">
                                <Button variant="link" className="text-dark p-2"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                                    <i className="bi bi-dash-lg"></i>
                                </Button>
                                <span className="px-3 fw-bold">{quantity}</span>
                                <Button variant="link" className="text-dark p-2"
                                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}>
                                    <i className="bi bi-plus-lg"></i>
                                </Button>
                            </div>
                            <div className="d-flex flex-column gap-1">
                                <div className="d-flex align-items-center gap-2">
                                    {product.stock > 0 ? (
                                        <>
                                            <Badge
                                                bg={product.stock < 10 ? 'warning' : 'success'}
                                                className={`${product.stock < 10 ? 'text-dark' : 'text-white'} px-2 py-1`}
                                            >
                                                {product.stock < 10 ? 'Limited Stock' : 'In Stock'}
                                            </Badge>
                                            <span className="text-dark fw-bold">
                                                {product.stock} {product.stock === 1 ? 'unit' : 'units'}
                                            </span>
                                            <span className="text-muted small">available</span>
                                        </>
                                    ) : (
                                        <Badge bg="secondary" className="opacity-75">Currently Unavailable</Badge>
                                    )}
                                </div>
                                {product.unit && (
                                    <div className="text-muted small">
                                        <i className="bi bi-info-circle me-1"></i>
                                        Pack size: <span className="fw-medium">{product.unit}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Row className="g-3 align-items-center">
                            <Col xs={9} md={5}>
                                <Button
                                    variant="outline-dark"
                                    className="w-100 py-3 fw-bold rounded-3 btn-premium-secondary"
                                    onClick={handleAddToCart}
                                    disabled={isAdding || product.stock <= 0}
                                >
                                    <i className="bi bi-cart-plus me-2"></i>
                                    Add to Cart
                                </Button>
                            </Col>

                            <Col xs={12} md={5}>
                                <Button
                                    variant={product.is_flash_deal ? "danger" : "primary"}
                                    className="w-100 py-3 fw-bold rounded-3 shadow-sm btn-premium-main"
                                    onClick={handleBuyNow}
                                    disabled={isAdding || product.stock <= 0}
                                >
                                    {isAdding ? (
                                        <Spinner size="sm" className="me-2" />
                                    ) : (
                                        <i className="bi bi-lightning-charge-fill me-2"></i>
                                    )}
                                    {product.stock <= 0 ? "Out of Stock" : "BUY NOW"}
                                </Button>
                            </Col>

                            {/* Wishlist - Minimalist Action */}
                            <Col xs={3} md={2}>
                                <Button
                                    variant="light"
                                    className="w-100 py-3 rounded-3 border wishlist-btn-detail"
                                >
                                    <i className="bi bi-heart"></i>
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Related Products Section Added Below */}
                {relatedProducts.length > 0 && (
                    <div className="related-products-section mt-5 pt-5" data-aos="fade-up">
                        <hr className="mb-5 opacity-10" />
                        <h3 className="fw-bold mb-4">You May Also Like</h3>
                        <Row className="g-4">
                            {relatedProducts.map((item) => (
                                <Col key={item.id} xs={12} sm={6} md={4} lg={3}>
                                    <ProductCard product={item} />
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}

                <ToastMessage
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    message={toastMessage}
                    title="Cart"
                />
            </Container>
        </div>
    );
};

export default ProductDetail;