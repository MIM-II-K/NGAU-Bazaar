import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from 'react-bootstrap';
import { getProductImageUrl } from '../utils/urlHelper';
import '../styles/product-quick-view.css';

const API_BASE_URL = "https://ngau-bazaar.onrender.com";
const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f0f4f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='16' fill='%23aab8aa'%3ENo Image%3C/text%3E%3C/svg%3E";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 30 } },
  exit: { opacity: 0, scale: 0.94, y: 20, transition: { duration: 0.2 } },
};

const ProductQuickView = ({ product, onClose, onAddToCart, isWishlisted, onToggleWishlist }) => {
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlist] = useState(false);
  const modalRef = useRef(null);

  // Lock body scroll when modal opens
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const discountPct = product.is_flash_deal && product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const getImg = (img) => img?.url
    ? getProductImageUrl(img.url, API_BASE_URL)
    : fallbackImage;

  const handleAdd = async () => {
    if (isOutOfStock) return;
    setAdding(true);
    await onAddToCart(product, quantity);
    setAdding(false);
  };

  const handleWishlist = async () => {
    setWishlist(true);
    await onToggleWishlist(product.id);
    setWishlist(false);
  };

  const handleViewFull = () => {
    onClose();
    navigate(`/products/${product.slug}`);
  };

  // Modal content
  const modalContent = (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="qv-backdrop"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />
      <motion.div
        key="modal"
        className="qv-modal"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${product.name}`}
        ref={modalRef}
      >
        <button className="qv-close" onClick={onClose} aria-label="Close">
          <i className="bi bi-x-lg" />
        </button>

        <div className="qv-inner">
          {/* Left: Gallery */}
          <div className="qv-gallery">
            <div className="qv-main-img-wrap">
              <img
                key={activeImg}
                src={product.images?.length > 0 ? getImg(product.images[activeImg]) : fallbackImage}
                alt={product.name}
                className="qv-main-img"
                onError={(e) => (e.target.src = fallbackImage)}
              />
              {product.is_flash_deal && discountPct > 0 && (
                <div className="qv-flash-badge">
                  <i className="bi bi-lightning-charge-fill" /> -{discountPct}%
                </div>
              )}
              {isOutOfStock && (
                <div className="qv-oos-overlay">Out of Stock</div>
              )}
            </div>

            {product.images?.length > 1 && (
              <div className="qv-thumbnails">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`qv-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    onMouseEnter={() => setActiveImg(i)}
                  >
                    <img src={getImg(img)} alt={`Thumb ${i + 1}`} onError={(e) => (e.target.src = fallbackImage)} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="qv-info">
            {product.category?.name && (
              <span className="qv-category">{product.category.name}</span>
            )}

            <h2 className="qv-title">{product.name}</h2>

            <div className="qv-price-block">
              {product.is_flash_deal && product.discount_price ? (
                <div className="qv-price-row">
                  <span className="qv-price-sale">Rs. {product.discount_price.toLocaleString()}</span>
                  <span className="qv-price-strike">Rs. {product.price.toLocaleString()}</span>
                  <span className="qv-save-badge">
                    Save Rs. {(product.price - product.discount_price).toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="qv-price-row">
                  <span className="qv-price-main">Rs. {product.price.toLocaleString()}</span>
                </div>
              )}
              <span className="qv-price-unit">per {product.unit || 'pc'}</span>
            </div>

            <div className="qv-stock-status">
              {isOutOfStock ? (
                <span className="qv-stock oos"><i className="bi bi-x-circle-fill" /> Out of Stock</span>
              ) : isLowStock ? (
                <span className="qv-stock low"><i className="bi bi-exclamation-triangle-fill" /> Only {product.stock} left! Hurry</span>
              ) : (
                <span className="qv-stock ok"><i className="bi bi-check-circle-fill" /> In Stock ({product.stock} units)</span>
              )}
            </div>

            {product.description && (
              <p className="qv-desc">
                {product.description.length > 160
                  ? product.description.substring(0, 160) + '…'
                  : product.description}
              </p>
            )}

            {product.tags?.length > 0 && (
              <div className="qv-tags">
                {product.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="qv-tag">#{tag}</span>
                ))}
                {product.tags.length > 3 && <span className="qv-tag more">+{product.tags.length - 3}</span>}
              </div>
            )}

            {!isOutOfStock && (
              <div className="qv-qty-row">
                <span className="qv-qty-label">Quantity</span>
                <div className="qv-qty-ctrl">
                  <button
                    className="qv-qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <i className="bi bi-dash" />
                  </button>
                  <span className="qv-qty-val">{quantity}</span>
                  <button
                    className="qv-qty-btn"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <i className="bi bi-plus" />
                  </button>
                </div>
                <span className="qv-qty-hint">max {product.stock}</span>
              </div>
            )}

            <div className="qv-actions">
              <button
                className="qv-add-btn"
                onClick={handleAdd}
                disabled={adding || isOutOfStock}
              >
                {adding ? (
                  <><Spinner as="span" size="sm" animation="border" className="me-2" /> Adding...</>
                ) : isOutOfStock ? (
                  <><i className="bi bi-x-circle-fill me-2" /> Out of Stock</>
                ) : (
                  <><i className="bi bi-cart-plus-fill me-2" /> Add to Cart</>
                )}
              </button>

              <button
                className={`qv-wish-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlist}
                disabled={wishlisting}
                aria-label="Wishlist"
              >
                {wishlisting ? (
                  <Spinner as="span" size="sm" animation="border" />
                ) : (
                  <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}`} />
                )}
              </button>
            </div>

            <button className="qv-full-link" onClick={handleViewFull}>
              View full details <i className="bi bi-arrow-right" />
            </button>

            <div className="qv-trust">
              <span><i className="bi bi-shield-check" /> Secure Checkout</span>
              <span><i className="bi bi-truck" /> Fast Delivery</span>
              <span><i className="bi bi-arrow-repeat" /> Easy Returns</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );

  // Use portal to render at body root
  return createPortal(modalContent, document.body);
};

export default ProductQuickView;