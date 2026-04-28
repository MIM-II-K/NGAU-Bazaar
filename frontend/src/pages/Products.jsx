import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Badge, Spinner, Pagination as BootstrapPagination } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { productApi } from '../utils/productApi';
import { categoryApi } from '../utils/categoryApi';
import { addToCart } from '../utils/cartApi';
import { getProductImageUrl } from '../utils/urlHelper';
import ProductQuickView from '../components/ProductQuickView';
import ToastMessage from '../components/ToastMessage';
import '../styles/products.css';

const API_BASE_URL = "https://ngau-bazaar.onrender.com";

const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f0f4f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='16' fill='%23aab8aa'%3ENo Image%3C/text%3E%3C/svg%3E";

const SORT_OPTIONS = [
  { value: '', label: 'Featured', icon: 'bi-stars' },
  { value: 'newest', label: 'Newest', icon: 'bi-clock-history' },
  { value: 'popularity', label: 'Most Popular', icon: 'bi-fire' },
  { value: 'price_asc', label: 'Price: Low→High', icon: 'bi-sort-numeric-up' },
  { value: 'price_desc', label: 'Price: High→Low', icon: 'bi-sort-numeric-down' },
  { value: 'name_asc', label: 'Name: A→Z', icon: 'bi-sort-alpha-up' },
];

// ---------- Animation Variants ----------
const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
  exit: { opacity: 0, y: -16, scale: 0.97, transition: { duration: 0.2 } },
};

const filterVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } },
};

// ---------- Skeleton Card ----------
const SkeletonCard = () => (
  <div className="ngau-skeleton-card">
    <div className="skeleton-img shimmer-block" />
    <div className="skeleton-body">
      <div className="skeleton-line w-80 shimmer-block" />
      <div className="skeleton-line w-50 shimmer-block" />
      <div className="skeleton-line w-60 shimmer-block" />
      <div className="skeleton-btn shimmer-block" />
    </div>
  </div>
);

// ---------- Product Card ----------
const ProductCard = ({ product, onQuickView, onAddToCart, wishlistIds, onToggleWishlist }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [wishlisting, setWishlist] = useState(false);

  const imageUrl = !imgError && product.images?.length > 0
    ? getProductImageUrl(product.images[0].url, API_BASE_URL)
    : fallbackImage;

  const isWishlisted = wishlistIds.has(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;
  const discountPct = product.is_flash_deal && product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (isOutOfStock || adding) return;
    setAdding(true);
    await onAddToCart(product, 1);
    setAdding(false);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    setWishlist(true);
    await onToggleWishlist(product.id);
    setWishlist(false);
  };

  return (
    <motion.div
      className={`ngau-product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
      variants={cardVariants}
      layout
      whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(52,107,60,0.18)' }}
      transition={{ duration: 0.25 }}
    >
      {/* Image Container */}
      <div
        className="ngau-card-image-wrap"
        onClick={() => navigate(`/products/${product.slug}`)}
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="ngau-card-img"
          onError={() => setImgError(true)}
          loading="lazy"
        />

        {/* Overlay actions */}
        <div className="ngau-card-overlay">
          <motion.button
            className="ngau-overlay-btn"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            title="Quick View"
          >
            <i className="bi bi-eye" />
          </motion.button>
          <motion.button
            className={`ngau-overlay-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleWishlist}
            disabled={wishlisting}
            title="Wishlist"
          >
            <i className={`bi bi-heart${isWishlisted ? '-fill' : ''}`} />
          </motion.button>
        </div>

        {/* Badges */}
        <div className="ngau-card-badges">
          {product.is_flash_deal && discountPct > 0 && (
            <span className="ngau-badge flash">
              <i className="bi bi-lightning-charge-fill" /> -{discountPct}%
            </span>
          )}
          {isOutOfStock && <span className="ngau-badge oos">Out of Stock</span>}
          {isLowStock && !isOutOfStock && (
            <span className="ngau-badge low">
              <i className="bi bi-hourglass-split" /> {product.stock} left
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="ngau-card-body">
        {product.category?.name && (
          <span className="ngau-card-category">{product.category.name}</span>
        )}

        <h3
          className="ngau-card-title"
          onClick={() => navigate(`/products/${product.slug}`)}
        >
          {product.name}
        </h3>

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="ngau-card-tags">
            {product.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="ngau-tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Price Row */}
        <div className="ngau-card-price-row">
          {product.is_flash_deal && product.discount_price ? (
            <>
              <span className="ngau-price-current">Rs.{product.discount_price}</span>
              <span className="ngau-price-original">Rs.{product.price}</span>
            </>
          ) : (
            <span className="ngau-price-current">Rs.{product.price}</span>
          )}
          <span className="ngau-price-unit">/ {product.unit || 'pc'}</span>
        </div>

        {/* Add to Cart */}
        <motion.button
          className={`ngau-add-btn ${isOutOfStock ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
          whileTap={!isOutOfStock ? { scale: 0.96 } : {}}
        >
          {adding ? (
            <><span className="ngau-btn-spinner" /> Adding...</>
          ) : isOutOfStock ? (
            <><i className="bi bi-x-circle me-2" />Out of Stock</>
          ) : (
            <><i className="bi bi-cart-plus-fill me-2" />Add to Cart</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ---------- Pagination Component ----------
const PaginationControls = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="ngau-pagination-wrapper">
      <BootstrapPagination className="justify-content-center">
        <BootstrapPagination.First
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || isLoading}
        />
        <BootstrapPagination.Prev
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
        />
        
        {getPageNumbers().map((pageNum, idx) => (
          pageNum === '...' ? (
            <BootstrapPagination.Ellipsis key={`ellipsis-${idx}`} disabled />
          ) : (
            <BootstrapPagination.Item
              key={pageNum}
              active={pageNum === currentPage}
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
            >
              {pageNum}
            </BootstrapPagination.Item>
          )
        ))}
        
        <BootstrapPagination.Next
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
        />
        <BootstrapPagination.Last
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || isLoading}
        />
      </BootstrapPagination>
    </div>
  );
};

// ================================================================
//  MAIN products PAGE
// ================================================================
const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshCart } = useCart();
  const { isAuthenticated } = useAuth();

  // ---- State ----
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const categoryScrollRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [liveSearch, setLiveSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const searchRef = useRef(null);
  const LIMIT = 12;

  // ---- Fetch products with pagination ----
  const fetchProducts = useCallback(async (pageNum = currentPage, shouldPreserveScroll = false) => {
    setLoading(true);

    try {
      const params = {
        search: search || undefined,
        category: category || undefined,
        sort: sort || undefined,
        min_price: minPrice || undefined,
        max_price: maxPrice || undefined,
        page: pageNum,
        limit: LIMIT,
      };

      const res = await productApi.getAll(params);

      // Handle both {data, totalPages} and bare array
      const items = Array.isArray(res) ? res : (res.data || []);
      const pages = res.totalPages || 1;
      const tot = res.total || items.length;

      setProducts(items);
      setCurrentPage(pageNum);
      setTotalPages(pages);
      setTotal(tot);

      // Scroll to top on page change unless preserving scroll
      if (!shouldPreserveScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Update URL with page parameter
      const urlParams = {};
      if (search) urlParams.search = search;
      if (category) urlParams.category = category;
      if (sort) urlParams.sort = sort;
      if (minPrice) urlParams.min_price = minPrice;
      if (maxPrice) urlParams.max_price = maxPrice;
      if (pageNum > 1) urlParams.page = pageNum;
      setSearchParams(urlParams, { replace: true });

      // Wishlist IDs
      if (isAuthenticated()) {
        const ids = new Set(items.filter(p => p.is_in_wishlist).map(p => p.id));
        setWishlistIds(ids);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, minPrice, maxPrice, isAuthenticated, currentPage]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll();
        setCategories([{ id: '', name: 'All' }, ...data]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([{ id: '', name: 'All' }]);
      }
    };
    fetchCategories();
  }, []);
  
  // Initial fetch + when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
  }, [search, category, sort, minPrice, maxPrice]);

  // Sync URL params and fetch when page changes via pagination
  useEffect(() => {
    const pageFromUrl = parseInt(searchParams.get('page')) || 1;
    if (pageFromUrl !== currentPage) {
      fetchProducts(pageFromUrl);
    }
  }, [searchParams.get('page')]);

  // Live search suggestions debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (liveSearch.length < 2) { 
        setSuggestions([]); 
        return;
      }

      try {
        const res = await productApi.getAll({ search: liveSearch, limit: 5 });
        const items = Array.isArray(res) ? res : (res.data || []);
        setSuggestions(items);
        setShowSugg(true);
      } catch { 
        setSuggestions([]); 
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [liveSearch]);

  // ---- Handlers ----
  const handlePageChange = (newPage) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
    fetchProducts(newPage);
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setSearch(liveSearch);
    setCurrentPage(1);
    setShowSugg(false);
  };

  const handleSuggestionClick = (product) => {
    setShowSugg(false);
    navigate(`/products/${product.slug}`);
  };

  const handleAddToCart = async (product, qty) => {
    try {
      await addToCart(product.id, qty);
      await refreshCart();
      setToastMsg(`✓ ${product.name} added to cart!`);
    } catch {
      // Guest fallback
      const cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const item = cart.find(i => i.productId === product.id);
      if (item) item.quantity += qty;
      else cart.push({ productId: product.id, quantity: qty, product: { id: product.id, name: product.name, price: product.discount_price || product.price, image: product.images?.[0]?.url, stock: product.stock } });
      localStorage.setItem('guestCart', JSON.stringify(cart));
      setToastMsg(`✓ Added to cart (guest). Login to save!`);
    }
    setShowToast(true);
  };

  const handleToggleWishlist = async (productId) => {
    if (!isAuthenticated()) {
      setToastMsg('Please login to manage your wishlist.');
      setShowToast(true);
      return;
    }

    const wasInWishlist = wishlistIds.has(productId);

    // Optimistic update
    setWishlistIds(prev => {
      const newSet = new Set(prev);
      if (wasInWishlist) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    try {
      const res = await productApi.toggleWishlist(productId);
      const isNowInWishlist = res.status === 'added';

      if (isNowInWishlist === wasInWishlist) {
        setToastMsg(isNowInWishlist ? '♥ Added to wishlist' : 'Removed from wishlist');
      } else {
        setWishlistIds(prev => {
          const newSet = new Set(prev);
          if (isNowInWishlist) {
            newSet.add(productId);
          } else {
            newSet.delete(productId);
          }
          return newSet;
        });
        setToastMsg(isNowInWishlist ? '♥ Added to wishlist' : 'Removed from wishlist');
      }
      setShowToast(true);
    } catch (error) {
      // Revert optimistic update on error
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        if (wasInWishlist) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });
      setToastMsg('Failed to update wishlist. Please try again.');
      setShowToast(true);
      console.error('Wishlist toggle error:', error);
    }
  };

  // Draggable category scroll handler
  const handleCategoryMouseDown = (e) => {
    const container = categoryScrollRef.current;
    if (!container) return;
    let startX = e.pageX - container.offsetLeft;
    let scrollLeft = container.scrollLeft;

    const onMouseMove = (e) => {
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const clearFilters = () => {
    setSearch(''); 
    setLiveSearch(''); 
    setCategory('');
    setSort(''); 
    setMinPrice(''); 
    setMaxPrice('');
    setCurrentPage(1);
  };

  const hasActiveFilters = search || category || sort || minPrice || maxPrice;

  // ============================================================
  //  RENDER
  // ============================================================
  return (
    <>
      <Helmet>
        <title>Fresh Produce | Ngau Bazaar</title>
        <meta name="description" content="Browse fresh, organic, local harvest produce directly from farmers at Ngau Bazaar." />
      </Helmet>

      <div className="ngau-products-root">

        {/* ── HERO STRIP ── */}
        <div className="ngau-products-hero">
          <div className="ngau-hero-bg-pattern" />
          <Container fluid="xl">
            <motion.div
              className="ngau-hero-content"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="ngau-hero-eyebrow">
                <span className="ngau-leaf-dot">🌿</span>
                Fresh from local farms
              </div>
              <h1 className="ngau-hero-title">
                Farm-to-Table <span className="ngau-hero-accent">Harvest</span>
              </h1>
              <p className="ngau-hero-sub">
                {total > 0 ? `${total} products` : 'Fresh products'} — directly from farmers, zero middlemen
              </p>

              {/* ── SEARCH BAR ── */}
              <form className="ngau-search-form" onSubmit={handleSearchSubmit}>
                <div className="ngau-search-wrap" ref={searchRef}>
                  <i className="bi bi-search ngau-search-icon" />
                  <input
                    className="ngau-search-input"
                    type="text"
                    placeholder="Search tomatoes, turmeric, organic milk…"
                    value={liveSearch}
                    onChange={e => setLiveSearch(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                    onBlur={() => setTimeout(() => setShowSugg(false), 180)}
                  />
                  {liveSearch && (
                    <button
                      type="button"
                      className="ngau-search-clear"
                      onClick={() => { setLiveSearch(''); setSearch(''); setSuggestions([]); }}
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  )}
                  <button type="submit" className="ngau-search-btn">Search</button>

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {showSugg && suggestions.length > 0 && (
                      <motion.div
                        className="ngau-suggestions"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                      >
                        {suggestions.map(p => (
                          <div
                            key={p.id}
                            className="ngau-suggestion-item"
                            onMouseDown={() => handleSuggestionClick(p)}
                          >
                            <img
                              src={p.images?.[0]?.url ? getProductImageUrl(p.images[0].url, API_BASE_URL) : fallbackImage}
                              alt={p.name}
                              className="ngau-sugg-img"
                              onError={e => e.target.src = fallbackImage}
                            />
                            <div className="ngau-sugg-info">
                              <span className="ngau-sugg-name">{p.name}</span>
                              <span className="ngau-sugg-price">Rs.{p.discount_price || p.price} / {p.unit}</span>
                            </div>
                            <i className="bi bi-arrow-right ngau-sugg-arrow" />
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>
            </motion.div>
          </Container>
        </div>

        {/* ── CATEGORY PILLS (Draggable) ── */}
        <div className="ngau-category-bar">
          <Container fluid="xl">
            <div
              className="ngau-category-scroll"
              ref={categoryScrollRef}
              onMouseDown={handleCategoryMouseDown}
            >
              {categories.map(cat => (
                <motion.button
                  key={cat.id || 'all'}
                  className={`ngau-cat-pill ${category === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    setCategory(cat.id === category ? '' : cat.id);
                    setCurrentPage(1);
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          </Container>
        </div>

        {/* ── MAIN CONTENT ── */}
        <Container fluid="xl" className="ngau-products-body">
          <Row className="g-0 g-lg-4">

            {/* ── SIDEBAR FILTERS (Desktop) ── */}
            <Col lg={3} className="d-none d-lg-block">
              <motion.div
                className="ngau-sidebar"
                variants={filterVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="ngau-sidebar-header">
                  <span><i className="bi bi-sliders me-2" />Filters</span>
                  {hasActiveFilters && (
                    <button className="ngau-clear-btn" onClick={clearFilters}>
                      Clear all
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="ngau-filter-group">
                  <label className="ngau-filter-label">Sort By</label>
                  <select 
                    className="ngau-sort-select"
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categories */}
                <div className="ngau-filter-group">
                  <label className="ngau-filter-label">Categories</label>
                  <div className="ngau-cat-grid">
                    {categories.map(cat => (
                      <button
                        key={cat.id || 'all'}
                        className={`ngau-cat-grid-item ${category === cat.id ? 'active' : ''}`}
                        onClick={() => {
                          setCategory(cat.id === category ? '' : cat.id);
                          setCurrentPage(1);
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="ngau-filter-group">
                  <label className="ngau-filter-label">Price Range (Rs.)</label>
                  <div className="ngau-price-inputs">
                    <div className="ngau-price-field">
                      <span className="ngau-price-prefix">Min</span>
                      <input
                        type="number"
                        className="ngau-price-input"
                        placeholder="0"
                        value={minPrice}
                        min={0}
                        onChange={e => {
                          setMinPrice(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    <span className="ngau-price-sep">—</span>
                    <div className="ngau-price-field">
                      <span className="ngau-price-prefix">Max</span>
                      <input
                        type="number"
                        className="ngau-price-input"
                        placeholder="∞"
                        value={maxPrice}
                        min={0}
                        onChange={e => {
                          setMaxPrice(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>
                  {minPrice && maxPrice && Number(minPrice) > Number(maxPrice) && (
                    <p className="ngau-price-error">Min cannot exceed max</p>
                  )}
                </div>

                {/* Quick Filters */}
                <div className="ngau-filter-group">
                  <label className="ngau-filter-label">Quick Filters</label>
                  <div className="ngau-quick-chips">
                    <button
                      className={`ngau-chip ${sort === 'newest' ? 'active' : ''}`}
                      onClick={() => {
                        setSort('newest');
                        setCurrentPage(1);
                      }}
                    >
                      <i className="bi bi-clock me-1" />New Arrivals
                    </button>
                    <button
                      className={`ngau-chip ${sort === 'popularity' ? 'active' : ''}`}
                      onClick={() => {
                        setSort('popularity');
                        setCurrentPage(1);
                      }}
                    >
                      <i className="bi bi-fire me-1" />Trending
                    </button>
                  </div>
                </div>
              </motion.div>
            </Col>

            {/* ── PRODUCTS GRID ── */}
            <Col lg={9}>

              {/* Toolbar */}
              <div className="ngau-toolbar">
                <div className="ngau-toolbar-left">
                  {loading ? (
                    <span className="ngau-result-count">Loading…</span>
                  ) : (
                    <span className="ngau-result-count">
                      <strong>{total}</strong> product{total !== 1 ? 's' : ''}
                      {search && <> for <em>"{search}"</em></>}
                      {totalPages > 1 && <> · Page {currentPage} of {totalPages}</>}
                    </span>
                  )}

                  {/* Active filter chips */}
                  <div className="ngau-active-chips">
                    {category && (
                      <span className="ngau-active-chip">
                        {categories.find(c => c.id === category)?.name || category}
                        <button onClick={() => {
                          setCategory('');
                          setCurrentPage(1);
                        }}><i className="bi bi-x" /></button>
                      </span>
                    )}
                    {sort && (
                      <span className="ngau-active-chip">
                        {SORT_OPTIONS.find(s => s.value === sort)?.label}
                        <button onClick={() => {
                          setSort('');
                          setCurrentPage(1);
                        }}><i className="bi bi-x" /></button>
                      </span>
                    )}
                    {(minPrice || maxPrice) && (
                      <span className="ngau-active-chip">
                        Rs.{minPrice || '0'} – Rs.{maxPrice || '∞'}
                        <button onClick={() => { 
                          setMinPrice(''); 
                          setMaxPrice('');
                          setCurrentPage(1);
                        }}><i className="bi bi-x" /></button>
                      </span>
                    )}
                  </div>
                </div>

                <div className="ngau-toolbar-right">
                  {/* Mobile filter toggle */}
                  <button
                    className="ngau-filter-toggle d-lg-none"
                    onClick={() => setShowFilters(true)}
                  >
                    <i className="bi bi-sliders" /> Filters
                    {hasActiveFilters && <span className="ngau-filter-dot" />}
                  </button>

                  {/* View mode */}
                  <div className="ngau-view-toggle">
                    <button
                      className={`ngau-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                      title="Grid view"
                    >
                      <i className="bi bi-grid-3x3-gap" />
                    </button>
                    <button
                      className={`ngau-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                      title="List view"
                    >
                      <i className="bi bi-list-ul" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products */}
              {loading ? (
                <div className={`ngau-products-${viewMode}`}>
                  {Array.from({ length: LIMIT }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <motion.div
                  className="ngau-empty-state"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="ngau-empty-icon">🌱</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or searching for something else.</p>
                  <button className="ngau-empty-reset" onClick={clearFilters}>
                    Reset Filters
                  </button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    className={`ngau-products-${viewMode}`}
                    variants={pageVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence mode="popLayout">
                      {products.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onQuickView={setQuickViewProduct}
                          onAddToCart={handleAddToCart}
                          wishlistIds={wishlistIds}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Pagination Controls */}
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={loading}
                  />
                </>
              )}

            </Col>
          </Row>
        </Container>

        {/* ── MOBILE FILTER DRAWER ── */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                className="ngau-drawer-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
              />
              <motion.div
                className="ngau-filter-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              >
                <div className="ngau-drawer-header">
                  <span><i className="bi bi-sliders me-2" />Filters & Sort</span>
                  <button className="ngau-drawer-close" onClick={() => setShowFilters(false)}>
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
                <div className="ngau-drawer-body">

                  <div className="ngau-filter-group">
                    <label className="ngau-filter-label">Sort By</label>
                    <div className="ngau-sort-list">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          className={`ngau-sort-item ${sort === opt.value ? 'active' : ''}`}
                          onClick={() => {
                            setSort(opt.value);
                            setCurrentPage(1);
                          }}
                        >
                          <i className={`bi ${opt.icon} me-2`} />{opt.label}
                          {sort === opt.value && <i className="bi bi-check2 ms-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ngau-filter-group">
                    <label className="ngau-filter-label">Price Range (Rs.)</label>
                    <div className="ngau-price-inputs">
                      <div className="ngau-price-field">
                        <span className="ngau-price-prefix">Min</span>
                        <input type="number" className="ngau-price-input" placeholder="0" value={minPrice} min={0} onChange={e => {
                          setMinPrice(e.target.value);
                          setCurrentPage(1);
                        }} />
                      </div>
                      <span className="ngau-price-sep">—</span>
                      <div className="ngau-price-field">
                        <span className="ngau-price-prefix">Max</span>
                        <input type="number" className="ngau-price-input" placeholder="∞" value={maxPrice} min={0} onChange={e => {
                          setMaxPrice(e.target.value);
                          setCurrentPage(1);
                        }} />
                      </div>
                    </div>
                  </div>

                  <div className="ngau-filter-group">
                    <label className="ngau-filter-label">Categories</label>
                    <div className="ngau-cat-grid">
                      {categories.map(cat => (
                        <button
                          key={cat.id || 'all'}
                          className={`ngau-cat-grid-item ${category === cat.id ? 'active' : ''}`}
                          onClick={() => {
                            setCategory(cat.id === category ? '' : cat.id);
                            setCurrentPage(1);
                          }}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ngau-drawer-footer">
                  <button className="ngau-drawer-clear" onClick={() => { clearFilters(); setShowFilters(false); }}>
                    Clear All
                  </button>
                  <button className="ngau-drawer-apply" onClick={() => setShowFilters(false)}>
                    Show Results ({total})
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── QUICK VIEW MODAL ── */}
        <AnimatePresence>
          {quickViewProduct && (
            <ProductQuickView
              product={quickViewProduct}
              onClose={() => setQuickViewProduct(null)}
              onAddToCart={handleAddToCart}
              isWishlisted={wishlistIds.has(quickViewProduct.id)}
              onToggleWishlist={handleToggleWishlist}
            />
          )}
        </AnimatePresence>

        <ToastMessage
          show={showToast}
          onClose={() => setShowToast(false)}
          message={toastMsg}
          title="Ngau Bazaar"
        />
      </div>
    </>
  );
};

export default Products;