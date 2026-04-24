import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  InputGroup,
  Form,
  Pagination,
  Offcanvas
} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { animated } from '@react-spring/web';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Star,
  TrendingUp,
  Grid,
  List,
  ShoppingCart,
  Zap,
  Package,
  Tag,
  ChevronDown,
  CheckCircle,
  Clock
} from 'lucide-react';
import { productApi } from '../utils/productApi';
import { categoryApi } from '../utils/categoryApi';
import { addToCart } from '../utils/cartApi';
import { useCart } from '../contexts/CartContext';
import ToastMessage from '../components/ToastMessage';
import SkeletonLoader from '../components/SkeletonLoader';
import '../styles/products.css';

const API_BASE_URL = "https://ngau-bazaar.onrender.com";
const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

// Guest cart management
const getGuestCart = () => {
  const saved = localStorage.getItem('guestCart');
  return saved ? JSON.parse(saved) : [];
};

const saveGuestCart = (cart) => {
  localStorage.setItem('guestCart', JSON.stringify(cart));
};

const addToGuestCart = (product) => {
  const guestCart = getGuestCart();
  const existingItem = guestCart.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    guestCart.push({ ...product, quantity: 1 });
  }

  saveGuestCart(guestCart);
  return guestCart;
};

// Flash Sale Countdown Component
const FlashCountdown = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!endTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (isExpired || !endTime) return null;

  const { hours, minutes, seconds } = timeLeft;

  return (
    <div className="flash-countdown">
      <Clock size={14} className="countdown-icon" />
      <div className="countdown-timer">
        {hours > 0 && (
          <span className="countdown-unit">{hours.toString().padStart(2, '0')}<span className="countdown-label">h</span></span>
        )}
        <span className="countdown-unit">{minutes.toString().padStart(2, '0')}<span className="countdown-label">m</span></span>
        <span className="countdown-unit">{seconds.toString().padStart(2, '0')}<span className="countdown-label">s</span></span>
      </div>
    </div>
  );
};

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCart, isAuthenticated } = useCart();
  const productsRef = useRef(null);

  const searchParams = new URLSearchParams(location.search);
  const urlCategoryId = searchParams.get('category');
  const urlSearch = searchParams.get('search');
  const urlSort = searchParams.get('sort');

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(urlSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(urlCategoryId || 'all');
  const [sortBy, setSortBy] = useState(urlSort || 'newest');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [addingId, setAddingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const limit = 12;

  // Animation refs
  const { scrollYProgress } = useScroll({
    target: productsRef,
    offset: ["start start", "end start"]
  });
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const headerY = useTransform(scrollYProgress, [0, 0.3], [0, 50]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Update URL when filters change
  useEffect(() => {
    updateURLParams();
  }, [selectedCategory, searchTerm, sortBy, priceRange]);

  // Debounced search and filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  const updateURLParams = () => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    const newURL = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newURL);
  };

  const fetchCategories = async () => {
    try {
      const cats = await categoryApi.getAll();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async (currentPage = 1) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        sort: sortBy,
        min_price: priceRange[0],
        max_price: priceRange[1]
      };

      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchTerm) params.search = searchTerm;

      const res = await productApi.getAll(params);

      let rawProducts = [];
      let total = 0;

      if (Array.isArray(res)) {
        rawProducts = res;
        total = res.length;
      } else {
        rawProducts = res.products || [];
        total = res.total || rawProducts.length;
      }

      const mappedProducts = rawProducts.map(p => ({
        ...p,
        stock: p.quantity || p.stock || 0,
        category_name: categories.find(c => c.id.toString() === p.category_id?.toString())?.name || p.category_name || 'General',
        tags: p.tags ? (Array.isArray(p.tags) ? p.tags : p.tags.split(',')) : [],
        flash_sale_end: p.flash_sale_end || null // Add flash sale end time if available from API
      }));

      setProducts(mappedProducts);
      setTotalPages(Math.ceil(total / limit));
      setTotalProducts(total);
    } catch (err) {
      console.error('Failed to fetch products:', err.message);
      setProducts([]);
      setTotalPages(1);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      setToastMessage(`Sorry! ${product.name} is out of stock.`);
      setToastType('warning');
      setShowToast(true);
      return;
    }

    try {
      setAddingId(product.id);

      if (isAuthenticated) {
        await addToCart(product.id, 1);
        await refreshCart();
        setToastMessage(`Added ${product.name} to cart!`);
        setToastType('success');
      } else {
        // Guest cart fallback
        addToGuestCart(product);
        setToastMessage(`Added ${product.name} to guest cart! Login to save your cart.`);
        setToastType('info');
      }
      setShowToast(true);

      // Animate the cart icon
      const cartIcon = document.querySelector('.cart-icon-wrapper, .cart-badge');
      cartIcon?.classList.add('cart-bump');
      setTimeout(() => cartIcon?.classList.remove('cart-bump'), 300);
    } catch (err) {
      // Fallback to guest cart if API fails
      addToGuestCart(product);
      setToastMessage(`Added ${product.name} to guest cart!`);
      setToastType('info');
      setShowToast(true);
    } finally {
      setAddingId(null);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
    setPriceRange([0, 100000]);
    setPage(1);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || sortBy !== 'newest' || priceRange[0] > 0 || priceRange[1] < 100000;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const ProductCardComponent = ({ product, index }) => {
    const [isHovered, setIsHovered] = useState(false);
    const discount = product.is_flash_deal && product.discount_price ?
      Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

    const displayCategory = categories.find(c => c.id.toString() === product.category_id?.toString())?.name || product.category_name || 'General';
    const inStock = product.stock > 0;
    const stockCount = product.stock;

    // Get first 3 tags for display
    const displayTags = product.tags?.slice(0, 3) || [];
    const remainingTags = product.tags?.length - 3 || 0;

    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -8 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={() => navigate(`/products/${product.slug || product.id}`)}
        style={{ cursor: 'pointer' }}
      >
        <Card className={`product-card-modern ${viewMode === 'list' ? 'list-view' : ''}`}>
          <div className={`${viewMode === 'list' ? 'd-flex flex-column flex-sm-row' : ''}`}>
            <div className="image-zoom-container position-relative">
              <Card.Img
                variant="top"
                src={product.images?.[0]?.url?.startsWith('http') ? product.images[0].url : `${API_BASE_URL}${product.images?.[0]?.url || ''}`}
                onError={e => { e.currentTarget.src = fallbackImage; }}
              />

              {/* Flash Deal Badge */}
              {product.is_flash_deal && (
                <div className="product-badges">
                  <motion.div
                    className="flash-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Zap size={12} /> {discount}% OFF
                  </motion.div>
                </div>
              )}

              {/* Live Stock Count Badge */}
              <div className={`stock-count-badge ${inStock ? 'in-stock' : 'out-of-stock'}`}>
                {inStock ? (
                  <>
                    <Package size={12} />
                    <span>{stockCount} in stock</span>
                  </>
                ) : (
                  <>
                    <X size={12} />
                    <span>Out of Stock</span>
                  </>
                )}
              </div>

              {/* Hover Actions */}
              <motion.div
                className="product-hover-actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  className="hover-action-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={addingId === product.id || !inStock}
                >
                  <ShoppingCart size={18} />
                </motion.button>
              </motion.div>
            </div>

            <Card.Body className="d-flex flex-column">
              <div className="product-meta">
                <span className="category-badge">{displayCategory}</span>
              </div>

              <Card.Title className="product-title">{product.name}</Card.Title>

              {/* Tags Section */}
              {displayTags.length > 0 && (
                <div className="product-tags">
                  <Tag size={12} className="tags-icon" />
                  {displayTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="product-tag"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchTerm(tag.trim());
                      }}
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                  {remainingTags > 0 && (
                    <span className="product-tag more-tag">+{remainingTags}</span>
                  )}
                </div>
              )}

              {viewMode === 'list' && (
                <p className="product-description">
                  {product.description?.substring(0, 100)}...
                </p>
              )}

              <div className="product-price-section">
                <div className="price-info">
                  {product.is_flash_deal ? (
                    /* --- FLASH DEAL ACTIVE --- */
                    <div className="price-wrapper">
                      {/* Added 'is-flash' class here for the red color */}
                      <span className="current-price is-flash">
                        Rs.{product.discount_price}
                      </span>
                      <span className="original-price">
                        Rs.{product.price}
                      </span>
                    </div>
                  ) : (
                    /* --- NORMAL PRICE --- */
                    <span className="current-price">
                      Rs.{product.price}
                    </span>
                  )}
                  <small className="unit-text">/ {product.unit || 'pc'}</small>
                </div>
              </div>

              {/* Flash Sale Countdown Timer */}
              {product.is_flash_deal && product.flash_sale_end && (
                <FlashCountdown endTime={product.flash_sale_end} />
              )}

              {/* Full Width Add to Cart Button */}
              <motion.button
                className={`add-to-cart-full ${!inStock ? 'disabled' : ''} ${product.is_flash_deal ? 'flash-deal-btn' : ''}`}
                whileTap={inStock ? { scale: 0.98 } : {}}
                onClick={(e) => handleAddToCart(e, product)}
                disabled={addingId === product.id || !inStock}
              >
                {addingId === product.id ? (
                  <Spinner as="span" animation="border" size="sm" />
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </>
                )}
              </motion.button>
            </Card.Body>
          </div>
        </Card>
      </motion.div>
    );
  };

  // Pagination component
  const PaginationComponent = () => {
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination-wrapper">
        <button
          className="page-btn"
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >
          Previous
        </button>

        {startPage > 1 && (
          <>
            <button className="page-number" onClick={() => setPage(1)}>1</button>
            {startPage > 2 && <span className="page-dots">...</span>}
          </>
        )}

        {pages.map(p => (
          <button
            key={p}
            className={`page-number ${page === p ? 'active' : ''}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="page-dots">...</span>}
            <button className="page-number" onClick={() => setPage(totalPages)}>{totalPages}</button>
          </>
        )}

        <button
          className="page-btn"
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="products-page" ref={productsRef}>
      {/* Hero Section with Parallax */}
      <animated.div className="products-hero" style={{ opacity: headerOpacity, y: headerY }}>
        <Container>
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge bg="soft-primary" className="hero-badge">
                Fresh Market
              </Badge>
              <h1 className="hero-title">
                Premium <span className="text-gradient">Bazaar</span> Collections
              </h1>
              <p className="hero-subtitle">
                Discover the finest organic products from local farmers
              </p>
            </motion.div>
          </div>
        </Container>
      </animated.div>

      <Container className="products-container">
        {/* Search and Filter Bar */}
        <div className="action-bar-container">
          <div className="main-search-area">
            <div className="search-container">
              <div className="search-box">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  inputMode="search" /* Opens 'Search' key on mobile keyboard */
                  placeholder="Search 'Organic Honey'..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="clear-search"
                    aria-label="Clear search"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <motion.button
                className="filter-trigger"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(true)}
              >
                <SlidersHorizontal size={18} />
                <span>Filters</span>
                {hasActiveFilters && <span className="filter-dot"></span>}
              </motion.button>

              <div className="view-switcher">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              className="active-filters"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <span className="filters-label">Active Filters:</span>
              {searchTerm && (
                <div className="filter-tag">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')}><X size={12} /></button>
                </div>
              )}
              {selectedCategory !== 'all' && (
                <div className="filter-tag">
                  Category: {categories.find(c => c.id.toString() === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')}><X size={12} /></button>
                </div>
              )}
              {sortBy !== 'newest' && (
                <div className="filter-tag">
                  Sort: {sortBy.replace('_', ' ')}
                  <button onClick={() => setSortBy('newest')}><X size={12} /></button>
                </div>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                <div className="filter-tag">
                  Price: Rs.{priceRange[0]} - Rs.{priceRange[1]}
                  <button onClick={() => setPriceRange([0, 100000])}><X size={12} /></button>
                </div>
              )}
              <button className="clear-all-filters" onClick={clearAllFilters}>
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Horizontal Category Pills */}
        <div className="category-bar">
          <div className="category-pills-wrapper">
            <div className="category-pills">
              <button
                className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Products
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`category-pill ${selectedCategory === cat.id.toString() ? 'active' : ''
                    }`}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="sort-container">
          <div className="sort-selector-mobile">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="results-count-bar">
          <div className="results-count">
            {!loading && (
              <span>Showing {products.length} of {totalProducts} products</span>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <SkeletonLoader type="product" count={8} />
        ) : (
          <>
            <motion.div
              className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {products.length > 0 ? (
                products.map((product, index) => (
                  <ProductCardComponent key={product.id} product={product} index={index} />
                ))
              ) : (
                <motion.div
                  className="empty-state"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="empty-icon">🍃</div>
                  <h3>No products found</h3>
                  <p>Try adjusting your filters or search terms</p>
                  <button className="reset-filters-btn" onClick={clearAllFilters}>
                    Reset All Filters
                  </button>
                </motion.div>
              )}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && <PaginationComponent />}
          </>
        )}
      </Container>

      {/* Filter Sidebar */}
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end" className="filter-sidebar">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <SlidersHorizontal size={20} />
            Filter Products
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-range">
              <div className="price-range-labels">
                <span>Rs. {priceRange[0]}</span>
                <span>Rs. {priceRange[1]}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="price-slider"
              />
              <div className="price-inputs">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h4>Sort By</h4>
          </div>

          <button
            className="apply-filters-btn"
            onClick={() => setShowFilters(false)}
          >
            Apply Filters
          </button>
        </Offcanvas.Body>
      </Offcanvas>

      <ToastMessage
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        type={toastType}
      />
    </div>
  );
};

export default Products;