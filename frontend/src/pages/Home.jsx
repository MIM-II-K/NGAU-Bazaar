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
        const products = await productApi.getAll({ page: 1, limit: 8, sort: 'newest' });
        setFeaturedProducts(Array.isArray(products) ? products : []);
      } catch (error) {
        console.error('Error loading home data:', error);
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
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
      if (isInView && !hasAnimated) {
        setHasAnimated(true);
        let start = 0;
        const increment = end / (duration / 16);
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
        
        return () => clearInterval(timer);
      }
    }, [isInView, end, duration, hasAnimated]);

    return (
      <motion.div 
        ref={ref}
        className="stat-card-enhanced"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        whileHover={{ scale: 1.05, y: -5 }}
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
        
        <Container className="hero-container">
          <Row className="hero-row align-items-center">
            <Col lg={6} md={12} className="hero-content-col">
              <motion.div
                className="hero-content-wrapper"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div 
                  className="hero-badge"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <Leaf size={16} />
                  </motion.span>
                </motion.div>
                
                <h1 className="hero-title">
                  <span className="hero-line">Fresh Groceries</span>
                  <span className="hero-line">
                    <span className="text-gradient">Delivered in</span>
                  </span>
                  <span className="hero-line">
                    <motion.span 
                      className="highlight-text"
                      animate={{ 
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                      }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    >
                      Hours
                    </motion.span>
                  </span>
                </h1>
                
                <p className="hero-description">
                  Connect directly with local farmers. Get organic produce, traditional 
                  delicacies, and daily essentials delivered to your doorstep.
                </p>
                
                <div className="hero-buttons">
                  <motion.button 
                    onClick={() => navigate('/shop')} 
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ShoppingBag size={20} />
                    Start Shopping
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                  
                  {!isAuthenticated && (
                    <motion.button 
                      onClick={() => navigate('/register')} 
                      className="btn-outline"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Join NGAU Free
                    </motion.button>
                  )}
                </div>
                
                <div className="hero-trust-badges">
                  {['Lightning Delivery', '24/7 Support', 'Secure Payment'].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      className="trust-badge"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                    >
                      <Shield size={14} />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Col>
            
            <Col lg={6} md={12} className="hero-image-col">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="hero-image-wrapper"
              >
                <div className="hero-image-container">
                  <img 
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&h=600" 
                    alt="Fresh organic vegetables from Nepal"
                    className="hero-main-image"
                  />
                  <div className="hero-image-glow" />
                </div>
                
                <motion.div 
                  className="floating-card delivery-card"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Truck size={20} />
                  <div>
                    <strong>Fresh Delivery</strong>
                    <small>within 2-4 hrs</small>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="floating-card organic-card"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Leaf size={20} />
                  <div>
                    <strong>100% Organic</strong>
                    <small>Certified quality</small>
                  </div>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ========== REST OF YOUR SECTIONS ========== */}
      {/* Stats Section */}
      <section className="stats-enhanced-section" ref={statsRef}>
        <Container>
          <motion.div 
            className="stats-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-eyebrow">IMPACT METRICS</span>
            <h2>Making a Difference</h2>
            <p>Real numbers behind our commitment to local farmers</p>
          </motion.div>
          
          <Row className="g-4">
            <Col md={3} sm={6}>
              <AnimatedCounter end={500} suffix="+" label="Local Farmers Partnered" />
            </Col>
            <Col md={3} sm={6}>
              <AnimatedCounter end={12} suffix="H" label="Max Delivery Time" />
            </Col>
            <Col md={3} sm={6}>
              <AnimatedCounter end={85} suffix="%" label="Revenue to Farmers" />
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
                <span className="impact-label">85% to 2025 Goal</span>
              </div>
            </div>
          </motion.div>
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