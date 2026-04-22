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
import { useSpring, animated, config } from '@react-spring/web';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  X, 
  ChevronDown,
  ChevronUp,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Grid,
  List,
  Heart,
  ShoppingCart,
  Eye,
  Zap
} from 'lucide-react';
import { productApi } from '../utils/productApi';
import { categoryApi } from '../utils/categoryApi';
import { addToCart } from '../utils/cartApi';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import ToastMessage from '../components/ToastMessage';
import SkeletonLoader from '../components/SkeletonLoader';
import '../styles/products.css';

const API_BASE_URL = "https://ngau-bazaar.onrender.com";
const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCart } = useCart();
  const { success, error } = useToast();
  const productsRef = useRef(null);

  const searchParams = new URLSearchParams(location.search);
  const urlCategoryId = searchParams.get('category');
  const urlSearch = searchParams.get('search');

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(urlSearch || '');
  const [selectedCategory, setSelectedCategory] = useState(urlCategoryId || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [addingId, setAddingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 12;

  // Animation refs
  const { scrollYProgress } = useScroll({
    target: productsRef,
    offset: ["start start", "end start"]
  });
  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  useEffect(() => {
    fetchCategories();
    updateURLParams();
  }, [selectedCategory, searchTerm, sortBy]);

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
      const rawProducts = Array.isArray(res) ? res : res.products || [];
      const total = res.total || rawProducts.length;

      const mappedProducts = rawProducts.map(p => ({
        ...p,
        stock: p.quantity || p.stock,
        category_name: categories.find(c => c.id.toString() === p.category_id?.toString())?.name || p.category_name || 'General'
      }));

      setProducts(mappedProducts);
      setTotalPages(Math.ceil(total / limit));
      setTotalProducts(total);
    } catch (err) {
      console.error('Failed to fetch products:', err.message);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (e, product) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      error(`Sorry! ${product.name} is out of stock.`);
      return;
    }

    try {
      setAddingId(product.id);
      await addToCart(product.id, 1);
      await refreshCart();
      success(`Added ${product.name} to cart!`, 2000);
      
      // Animate the cart icon
      const cartIcon = document.querySelector('.cart-btn-wrapper');
      cartIcon?.classList.add('cart-bump');
      setTimeout(() => cartIcon?.classList.remove('cart-bump'), 300);
    } catch (err) {
      error(err.message || 'Failed to add to cart. Please login.');
    } finally {
      setAddingId(null);
    }
  };

  const handleBuyNow = async (e, product) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      error(`Sorry! ${product.name} is out of stock.`);
      return;
    }

    try {
      setAddingId(product.id);
      await addToCart(product.id, 1);
      await refreshCart();
      navigate('/checkout');
    } catch (err) {
      error(err.message || 'Failed to process. Please login.');
    } finally {
      setAddingId(null);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('newest');
    setPriceRange([0, 10000]);
    setPage(1);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || sortBy !== 'newest' || priceRange[0] > 0 || priceRange[1] < 10000;

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

    return (
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -8 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className={`product-card-modern ${viewMode === 'list' ? 'list-view' : ''}`}>
          <div className={`${viewMode === 'list' ? 'd-flex' : ''}`}>
            <div className="image-zoom-container position-relative">
              <Card.Img
                variant="top"
                src={product.images?.[0]?.url?.startsWith('http') ? product.images[0].url : `${API_BASE_URL}${product.images?.[0]?.url || ''}`}
                onError={e => { e.currentTarget.src = fallbackImage; }}
              />
              
              {/* Badges */}
              <div className="product-badges">
                {product.is_flash_deal && (
                  <motion.div 
                    className="flash-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Zap size={12} /> {discount}% OFF
                  </motion.div>
                )}
                {product.stock < 10 && product.stock > 0 && (
                  <div className="low-stock-badge">Only {product.stock} left</div>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/products/${product.slug}`);
                  }}
                >
                  <Eye size={18} />
                </motion.button>
                <motion.button
                  className="hover-action-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleQuickAdd(e, product)}
                  disabled={addingId === product.id}
                >
                  <ShoppingCart size={18} />
                </motion.button>
              </motion.div>
            </div>

            <Card.Body className="d-flex flex-column">
              <div className="product-meta">
                <span className="category-badge">{product.category_name}</span>
                <div className="product-rating">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{(product.avg_rating || 4.5).toFixed(1)}</span>
                  <span className="review-count">({product.review_count || 0})</span>
                </div>
              </div>

              <Card.Title className="product-title">{product.name}</Card.Title>
              
              {viewMode === 'list' && (
                <p className="product-description">
                  {product.description?.substring(0, 100)}...
                </p>
              )}

              <div className="product-price-section">
                {product.is_flash_deal ? (
                  <div className="price-wrapper">
                    <span className="current-price">Rs.{product.discount_price}</span>
                    <span className="original-price">Rs.{product.price}</span>
                  </div>
                ) : (
                  <span className="current-price">Rs.{product.price}</span>
                )}
                <small className="unit-text">/ {product.unit || 'pc'}</small>
              </div>

              <div className="product-actions">
                <motion.button
                  className="btn-add-cart"
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => handleQuickAdd(e, product)}
                  disabled={addingId === product.id || product.stock <= 0}
                >
                  {addingId === product.id ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    <ShoppingCart size={18} />
                  )}
                </motion.button>
                <motion.button
                  className={`btn-buy-now ${product.is_flash_deal ? 'flash-deal' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => handleBuyNow(e, product)}
                  disabled={product.stock <= 0}
                >
                  {product.stock <= 0 ? 'Out of Stock' : 'Buy Now'}
                </motion.button>
              </div>
            </Card.Body>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="products-page" ref={productsRef}>
      {/* Hero Section with Parallax */}
      <animated.div className="products-hero" style={{ opacity: headerOpacity }}>
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
        <div className="search-filter-bar">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search for organic products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="clear-search">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filter-actions">
            <motion.button
              className="filter-toggle"
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(true)}
            >
              <SlidersHorizontal size={18} />
              Filters
            </motion.button>
            
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
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
              <button className="clear-all-filters" onClick={clearAllFilters}>
                Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Pills */}
        <div className="category-pills-wrapper">
          <div className="category-pills">
            <button
              className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Products
              {selectedCategory === 'all' && (
                <motion.span layoutId="active-pill" className="active-indicator" />
              )}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-pill ${selectedCategory === cat.id.toString() ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id.toString())}
              >
                {cat.name}
                {selectedCategory === cat.id.toString() && (
                  <motion.span layoutId="active-pill" className="active-indicator" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sort and Results Info */}
        <div className="sort-info-bar">
          <div className="results-count">
            {!loading && (
              <span>Showing {products.length} of {totalProducts} products</span>
            )}
          </div>
          <div className="sort-selector">
            <label>
              <TrendingUp size={16} />
              Sort by:
            </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="popularity">Most Popular</option>
            </select>
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
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>
                <div className="page-numbers">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`page-number ${page === pageNum ? 'active' : ''}`}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
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
              <input
                type="range"
                min="0"
                max="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="price-slider"
              />
              <div className="price-inputs">
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  placeholder="Max"
                />
              </div>
            </div>
          </div>

          <div className="filter-section">
            <h4>Availability</h4>
            <label className="checkbox-label">
              <input type="checkbox" /> In Stock Only
            </label>
          </div>

          <button
            className="apply-filters-btn"
            onClick={() => setShowFilters(false)}
          >
            Apply Filters
          </button>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default Products;