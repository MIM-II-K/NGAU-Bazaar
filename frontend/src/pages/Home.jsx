import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Truck,
  Clock,
  Users,
  Star,
  TrendingUp,
  Shield,
  ShoppingBag,
  ArrowRight,
  Zap,
  Heart,
  MapPin,
  Sun,
  Coffee,
  Apple,
  Wheat,
  Award,
  Package,
  RefreshCw
} from 'lucide-react';

// Import your existing components
import ProductCard from '../components/ProductCard';
import Categories from './Categories';
import { productApi } from '../utils/productApi';
import { categoryApi } from '../utils/categoryApi';
import { useAuth } from '../contexts/AuthContext';
import '../styles/home.css';
import SmartBasket from '../components/SmartBasket';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Refs for parallax
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  // State
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats with animation
  const [counters, setCounters] = useState({
    farmers: 0,
    delivery: 0,
    customers: 0,
    satisfaction: 0
  });

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const response = await productApi.getAll({ page: 1, limit: 8, sort: 'newest' });
        
        // ✅ FIX: Handle the response correctly
        // The API returns { data: [], total, page, limit, totalPages }
        let products = [];
        if (response && response.data && Array.isArray(response.data)) {
          products = response.data;
        } else if (Array.isArray(response)) {
          products = response;
        } else {
          console.warn('Unexpected response format:', response);
          products = [];
        }
        
        setFeaturedProducts(products);
      } catch (error) {
        console.error('Error loading home data:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Animated Counter Component
  const AnimatedCounter = ({ end, suffix = "", duration = 2000, label }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);

    // Use a smaller margin or 'amount' to ensure it triggers as soon as it's visible
    const isInView = useInView(ref, { once: true, amount: 0.3 });
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (isInView && !hasAnimated) {
        console.log(`Starting animation for: ${label}`); // Debugging
        setHasAnimated(true);

        let startTime;
        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;
          const percentage = Math.min(progress / duration, 1);

          // Use an easeOutQuad formula for smoother numbers
          const currentCount = Math.floor(percentage * end);

          setCount(currentCount);

          if (percentage < 1) {
            requestAnimationFrame(animate);
          } else {
            setCount(end); // Ensure we land exactly on the final number
          }
        };

        requestAnimationFrame(animate);
      }
    }, [isInView, end, duration, hasAnimated, label]);

    return (
      <motion.div
        ref={ref}
        className="stat-card-enhanced"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <div className="stat-number">
          {count}{suffix}
        </div>
        <div className="stat-label">{label}</div>
        <motion.div
          className="stat-progress"
          initial={{ width: 0 }}
          animate={isInView ? { width: '100%' } : {}}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </motion.div>
    );
  };

  return (
    <div className="ngau-home">

      {/* ========== FIXED HERO SECTION - NO OVERLAP ========== */}
      <section className="hero-section" ref={heroRef}>
        <motion.div
          className="hero-bg-pattern"
          style={{ y: heroY }}
        />
        <div className="hero-gradient-overlay" />
        <section className="fresh-grocery-hero">
          <Container>
            <Row className="align-items-center">

              {/* LEFT COLUMN: TEXT CONTENT */}
              <Col lg={6} md={12} className="hero-text-col">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="hero-heading">
                    <span className="text-blue d-block">Fresh Groceries</span>
                    <span className="text-white-fade d-block">Delivered in</span>
                    <span className="text-green d-block">Hours</span>
                  </h1>

                  <p className="hero-subtitle">
                    Connect directly with local farmers. Get organic produce,
                    traditional delicacies, and daily essentials delivered to
                    your doorstep.
                  </p>
                  
                  {/* ✅ FIXED: Changed classname to className */}
                  <div className="shop-now-wrapper">
                    <button
                      onClick={() => navigate('/shop')}
                      className="btn-shop-now"
                    >
                      <ShoppingBag size={18} />
                      Start Shopping →
                    </button>
                  </div>
                  
                  <div className="hero-trust-row">
                    <span>Lightning Delivery</span>
                    <span>100% Local Sourced</span>
                    <span>Cash on Delivery</span>
                  </div>
                </motion.div>
              </Col>

              {/* RIGHT COLUMN: IMAGE & BADGES */}
              <Col lg={6} md={12} className="hero-img-col">
                <motion.div
                  className="hero-image-wrapper"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                    alt="Fresh Grocery Shelves"
                    className="main-hero-img"
                  />

                  {/* Top Left Badge */}
                  <div className="floating-badge badge-top-left">
                    <div className="badge-icon icon-green">
                      <Leaf size={18} />
                    </div>
                    <div className="badge-text">
                      <strong>100% Organic</strong>
                      <span>Certified quality</span>
                    </div>
                  </div>

                  {/* Bottom Right Badge */}
                  <div className="floating-badge badge-bottom-right">
                    <div className="badge-icon icon-orange">
                      <Truck size={18} />
                    </div>
                    <div className="badge-text">
                      <strong>Fresh Delivery</strong>
                      <span>within 2-4 hrs</span>
                    </div>
                  </div>
                </motion.div>
              </Col>

            </Row>
          </Container>
        </section>
      </section>
      
      {/* ========== REST OF YOUR SECTIONS ========== */}
      {/* Stats Section - UPDATED METRICS */}
      <section className="stats-enhanced-section" ref={statsRef}>
        <Container>
          <motion.div
            className="stats-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-eyebrow">OUR COMMITMENT</span>
            <h2>What We Guarantee</h2>
            <p>Honest promises we can keep from Day 1</p>
          </motion.div>

          {/* ========== UPDATED: Impact Metrics with Truthful Phase 1 Data ========== */}
          <Row className="g-4">
            <Col md={3} sm={6}>
              <AnimatedCounter end={100} suffix="%" label="Local Sourced" />
            </Col>
            <Col md={3} sm={6}>
              <AnimatedCounter end={24} suffix="H" label="Max Delivery Time" />
            </Col>
            <Col md={3} sm={6}>
              <AnimatedCounter end={0} suffix="" label="Middlemen" />
            </Col>
            <Col md={3} sm={6}>
              <AnimatedCounter end={100} suffix="%" label="Organic Guarantee" />
            </Col>
          </Row>

          <motion.div
            className="stats-impact-bar"
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: '100%', opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="impact-track">
              <div className="impact-fill" style={{ width: '85%' }}>
                <span className="impact-label">85% to 2027 Goal</span>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <section className="smart-basket-section">
        <Container>
          <SmartBasket />
        </Container>
      </section>

      {/* Categories Section */}
      <section className="categories-enhanced-section">
        <Container>
          <motion.div
            className="section-header-enhanced"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="section-eyebrow">SHOP BY</span>
              <h2>Product Categories</h2>
            </div>
            <Link to="/shop" className="view-all-btn">
              Browse All Categories
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          <Categories />
        </Container>
      </section>

      {/* Featured Products Section */}
      <section className="featured-enhanced-section">
        <Container>
          <motion.div
            className="section-header-enhanced"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="section-eyebrow">FRESH HARVEST</span>
              <h2>Today's Selection</h2>
              <p>Handpicked by our farmers this morning</p>
            </div>
            <Link to="/shop" className="view-all-btn">
              View All Products
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          {loading ? (
            <div className="text-center py-5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <RefreshCw size={40} className="text-primary" />
              </motion.div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No products available at the moment.</p>
            </div>
          ) : (
            <Row className="g-4">
              {featuredProducts.slice(0, 4).map((product, idx) => (
                <Col lg={3} md={6} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    whileHover={{ y: -8 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="benefits-3d-section">
        <Container>
          <motion.div
            className="benefits-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-eyebrow">WHY NGAU?</span>
            <h2>Fresh, Fast & Fair</h2>
          </motion.div>

          <Row className="g-4">
            {[
              {
                icon: <Truck size={32} />,
                title: 'Lightning Fast',
                desc: '2-4 hour delivery from local farms',
                gradient: 'linear-gradient(135deg, #10b981, #059669)'
              },
              {
                icon: <Leaf size={32} />,
                title: '100% Organic',
                desc: 'Certified organic, no chemicals',
                gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
              },
              {
                icon: <Users size={32} />,
                title: 'Farmer First',
                desc: '85% revenue goes to growers',
                gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
              }
            ].map((benefit, idx) => (
              <Col md={4} key={idx}>
                <motion.div
                  className="benefit-3d-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className="benefit-3d-inner">
                    <motion.div
                      className="benefit-icon-3d"
                      style={{ background: benefit.gradient }}
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {benefit.icon}
                    </motion.div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.desc}</p>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-enhanced-section">
        <Container>
          <motion.div
            className="cta-enhanced-wrapper"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="cta-enhanced-content">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="cta-icon"
              >
                <Award size={48} />
              </motion.div>
              <h2>Ready to Taste the Difference?</h2>
              <p>Join thousands of families enjoying fresh, organic groceries daily</p>
              <motion.button
                onClick={() => navigate('/shop')}
                className="cta-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Shopping Now
                <ArrowRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

export default Home;