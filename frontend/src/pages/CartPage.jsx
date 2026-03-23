import React, { useEffect, useState, useRef } from "react";
import { getCart, updateCart, removeFromCart } from "../utils/cartApi";
import { Container, Row, Col, Card, Button, Spinner, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from '../contexts/CartContext';
import ToastMessage from "../components/ToastMessage";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/cart.css';

const API_BASE_URL = "https://ngau-bazaar.onrender.com";
const DELIVERY_CHARGE = 100;
const TAX_RATE = 0.13; // 13% Tax
const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23adb5bd'%3ENo Image%3C/text%3E%3C/svg%3E";

const CartPage = () => {
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], total_items: 0, total_price: 0 });
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const debounceTimer = useRef({});

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    fetchCart();
    return () => Object.values(debounceTimer.current).forEach(clearTimeout);
  }, []);

  const resolveImageUrl = (path) => {
    if (!path) return fallbackImage;
    if (path.startsWith("http")) return path;
    let cleanPath = path.replace(/^\/+/, '');
    return `${API_BASE_URL}/${cleanPath.startsWith("static/") ? cleanPath : "static/product_images/" + cleanPath}`;
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await getCart();
      if (res && Array.isArray(res.items)) {
        setCart({
          ...res,
          total_price: Number(res.total_price || 0),
          total_items: Number(res.total_items || 0)
        });
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (product_id, newQty) => {
    if (newQty < 1) return;

    // Optimistic UI Update
    setCart(prev => {
      const updatedItems = prev.items.map(item =>
        item.product_id === product_id ? { ...item, quantity: newQty } : item
      );
      return {
        ...prev,
        items: updatedItems,
        total_items: updatedItems.reduce((sum, i) => sum + i.quantity, 0),
        total_price: updatedItems.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0)
      };
    });

    if (debounceTimer.current[product_id]) clearTimeout(debounceTimer.current[product_id]);
    debounceTimer.current[product_id] = setTimeout(async () => {
      try {
        await updateCart(product_id, newQty);
        await refreshCart();
      } catch (err) {
        fetchCart();
        setToastMessage("Sync failed.");
        setToastType("error");
        setShowToast(true);
      }
    }, 400);
  };

  const handleRemove = async (product_id) => {
    try {
      await removeFromCart(product_id);
      await refreshCart();
      await fetchCart();
      setToastMessage("Removed from bag.");
      setToastType("success");
      setShowToast(true);
    } catch (err) {
      setToastMessage("Removal failed.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const subtotal = cart.total_price;
  const taxAmount = subtotal * TAX_RATE;
  const grandTotal = subtotal + taxAmount + (subtotal > 0 ? DELIVERY_CHARGE : 0);

  if (loading) return (
    <div className="bazaar-loader">
      <Spinner animation="grow" variant="primary" />
    </div>
  );

  return (
    <div className="bazaar-cart-bg">
      <Container className="py-5 content-wrapper">
        <div className="mb-5 d-flex align-items-end justify-content-between" data-aos="fade-down">
          <div>
            <h1 className="fw-black mb-1">NGAU Bazaar</h1>
            <p className="fw-black mb-0 text-muted"><i className="bi bi-cart3"></i> Cart</p>
          </div>
          <Link to="/shop" className="text-decoration-none fw-bold text-primary d-none d-md-block">
            Continue Shopping <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        {cart.items.length === 0 ? (
          <div className="empty-cart-state text-center py-5 shadow-sm rounded-5 bg-white border">
            <i className="bi bi-cart-x display-1 text-light mb-4 d-block"></i>
            <h3 className="fw-bold">Your cart is empty</h3>
            <p className="text-muted mb-4">Add some of our mountain-fresh goods to get started.</p>
            <Link to="/shop" className="btn btn-primary btn-lg rounded-pill px-5">Browse Shop</Link>
          </div>
        ) : (
          <Row className="g-5">
            {/* ITEM LIST */}
            <Col lg={8}>
              {cart.items.map((item) => {
                const productSlug = item.product?.slug || item.slug;
                const hasDiscount = item.discount_percentage > 0;

                return (
                  <div key={item.product_id} className="bazaar-item-row mb-4" data-aos="fade-up">
                    <Row className="align-items-center g-0">
                      {/* Image Section */}
                      <Col xs={4} md={3}>
                        <Link to={`/products/${productSlug}`} className="d-block product-img-anchor">
                          <div className="item-img-container">
                            <img
                              src={item.product?.images?.[0]?.url ? resolveImageUrl(item.product.images[0].url) : item.image_url ? resolveImageUrl(item.image_url) : fallbackImage}
                              alt={item.product_name}
                              className="img-fluid full-photo"
                              onError={(e) => { e.target.src = fallbackImage; }}
                            />
                            {hasDiscount && (
                              <div className="flash-sale-badge-mini">-{Math.round(item.discount_percentage)}%</div>
                            )}
                          </div>
                        </Link>
                      </Col>

                      {/* Content Section */}
                      <Col xs={8} md={9} className="ps-3 ps-md-4">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="pe-2">
                            {/* Navigation via name (Slug-based) */}
                            <Link to={`/products/${productSlug}`} className="bazaar-product-link">
                              <h5 className="fw-bold mb-1">{item.product_name}</h5>
                            </Link>

                            <div className="price-container d-flex align-items-center gap-2 flex-wrap">
                              <h4 className="text-primary fw-black mb-0">Rs.{Number(item.price).toLocaleString()}</h4>
                              {hasDiscount && (
                                <>
                                  <span className="text-muted text-decoration-line-through small">
                                    Rs.{Number(item.original_price || item.price).toLocaleString()}
                                  </span>
                                  <Badge bg="danger" className="discount-pill">FLASH SALE</Badge>
                                </>
                              )}
                            </div>
                          </div>

                          <button
                            className="bazaar-remove-btn"
                            onClick={() => { setItemToDelete(item); setShowDeleteModal(true); }}
                            title="Remove from bag"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>

                        <div className="d-flex align-items-center justify-content-between mt-4">
                          <div className="bazaar-stepper">
                            <button onClick={() => handleUpdate(item.product_id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => handleUpdate(item.product_id, item.quantity + 1)}>+</button>
                          </div>
                          <div className="text-end">
                            <span className="text-muted small d-block">Subtotal</span>
                            <span className="fw-bold fs-5 text-dark">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                );
              })}
            </Col>

            {/* SUMMARY SIDEBAR */}
            <Col lg={4}>
              <div className="sticky-sidebar">
                <Card className="checkout-summary-card border-0 shadow-lg rounded-5 overflow-hidden">
                  <Card.Body className="p-4">
                    <h5 className="fw-black mb-4">Summary</h5>

                    <div className="summary-row mb-3">
                      <span className="text-muted">Bag Subtotal</span>
                      <span className="fw-bold">Rs.{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="summary-row mb-3">
                      <span className="text-muted">Estimated Tax (13%)</span>
                      <span className="fw-bold">Rs.{taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="summary-row mb-4 pb-3 border-bottom border-light">
                      <span className="text-muted">Delivery Charge</span>
                      <span className="text-success fw-bold">+ Rs.{DELIVERY_CHARGE}</span>
                    </div>

                    <div className="grand-total-display rounded-4 p-3 mb-4">
                      <p className="text-uppercase small fw-bold text-muted mb-0">Grand Total</p>
                      <h2 className="fw-black text-primary mb-0">Rs.{grandTotal.toLocaleString()}</h2>
                    </div>

                    <Button
                      onClick={() => navigate('/checkout')}
                      className="btn-checkout-bazaar w-100 py-3 rounded-pill fw-bold"
                    >
                      Proceed to Checkout <i className="bi bi-arrow-right ms-2"></i>
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        )}

        <ConfirmDeleteModal
          show={showDeleteModal}
          title="Remove Item?"
          message={
            itemToDelete ? (
              <div className="d-flex flex-column align-items-center py-2">
                <div className="product-removal-preview">
                  {itemToDelete.product_name}
                </div>
              </div>
            ) : ""
          }
          loading={isDeleting}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            setIsDeleting(true);
            await handleRemove(itemToDelete.product_id);
            setIsDeleting(false);
            setShowDeleteModal(false);
          }}
        />

        <ToastMessage show={showToast} onClose={() => setShowToast(false)} message={toastMessage} type={toastType} />
      </Container>
    </div>
  );
};

export default CartPage;