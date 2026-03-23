import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import flashDealsApi from '../utils/flashDealsApi';
import apiClient from '../utils/api';
import { createSlug } from '../utils/urlHelper' 
import '../styles/flash-deals.css';

const BASE_URL = "https://ngau\-bazaar.onrender.com";

const FlashDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const result = await flashDealsApi.getDeals();
        setDeals(Array.isArray(result) ? result : result?.data || []);
      } catch {
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };
    loadDeals();
  }, []);

  const handleAddToCart = async (product) => {
    setAddingId(product.id);
    try {
      await apiClient.post('/cart/add', {
        product_id: product.id,
        quantity: 1,
        price: product.discount_price ?? product.price
      });
      window.dispatchEvent(new Event('cartUpdated'));
    } finally {
      setTimeout(() => setAddingId(null), 800);
    }
  };

  if (loading) {
    return (
      <div className="minimal-loader">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="loader-ring"
        />
      </div>
    );
  }

  return (
    <div className="flash-scene">
      <Container className="py-5">
        <header className="editorial-header mb-5">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="editorial-title">
              NGAU
            <span className="ticker-label">/FLASHSALE</span>
            </h1>
          </motion.div>
        </header>

        <Row className="g-5">
          <AnimatePresence mode="popLayout">
            {deals.map((product, idx) => (
              <Col key={product.id} lg={4} md={6}>
                <ProductCard
                  product={product}
                  idx={idx}
                  isAdding={addingId === product.id}
                  onAdd={() => handleAddToCart(product)}
                />
              </Col>
            ))}
          </AnimatePresence>
        </Row>
      </Container>
    </div>
  );
};

/* ===============================
   PRODUCT CARD (FIXED WITH URL HELPER)
================================ */
const ProductCard = ({ product, idx, onAdd, isAdding }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  // Use backend slug if available, otherwise generate it using the helper
  const productSlug = product.slug ?? createSlug(product.name);

  const firstImage = product.images && product.images.length > 0
    ? product.images[0].url
    : null;

  const discountPercent =
    product.price > 0
      ? Math.round(((product.price - product.discount_price) / product.price) * 100)
      : 0;

  useEffect(() => {
    const calculateTime = () => {
      const diff = new Date(product.deal_expiry).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ expired: true });
        return;
      }
      setTimeLeft({
        expired: false,
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [product.deal_expiry]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="modern-unit"
    >
      <div className="img-container">
        {discountPercent > 0 && (
          <div className="percentage-tag">-{discountPercent}%</div>
        )}

        {/* Link using the generated productSlug */}
        <Link to={`/products/${productSlug}`} className='text-decoration-none'>
          <img
            src={firstImage ? `${BASE_URL}${firstImage}` : '/placeholder.png'}
            alt={product.name}
            className="clickable-img"
            style={{ cursor: 'pointer' }}
          />
        </Link>

        {timeLeft && !timeLeft.expired && (
          <div className="floating-timer">
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
        )}

        {timeLeft?.expired && (
          <div className="floating-timer expired">EXPIRED</div>
        )}
      </div>

      <div className="details-box">
        <div className="d-flex justify-content-between align-items-start">
          <Link to={`/products/${productSlug}`} className="text-decoration-none">
            <h2 className="unit-name clickable-title" style={{ cursor: 'pointer' }}>
              {product.name}
            </h2>
          </Link>

          <div className="price-stack">
            <span className="old-price">Rs.{product.price}</span>
            <span className="new-price">Rs.{product.discount_price}</span>
          </div>
        </div>

        <div className="action-area mt-4">
          <button
            className={`add-btn ${isAdding ? 'active' : ''}`}
            onClick={onAdd}
            disabled={isAdding}
          >
            {isAdding ? <Spinner animation="border" size="sm" /> : 'ADD TO CART'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FlashDeals;