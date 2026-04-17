import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
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
  RefreshCw,
  Quote,
  ChevronRight,
  Play,
  Pause,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  Globe,
  Mountain,
  Droplet,
  Wind,
  CheckCircle,
  Calendar,
  Target,
  Eye,
  ChevronLeft
} from 'lucide-react';

// Import your existing components
import ProductCard from '../components/ProductCard';
import { productApi } from '../utils/productApi';
import { categoryApi } from '../utils/categoryApi';
import { useAuth } from '../contexts/AuthContext';
import '../styles/about-us.css';

const AboutUs = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const containerRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [hoverCard, setHoverCard] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  // Fetch real products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch featured/best-selling products for "The Collection" section
        const products = await productApi.getAll({ page: 1, limit: 3, sort: 'popularity' });
        setFeaturedProducts(Array.isArray(products) ? products : []);
        
        // Fetch categories for the collection filter
        const cats = await categoryApi.getAll();
        setCategories(Array.isArray(cats) ? cats.slice(0, 6) : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Auto-rotate farmer stories
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStory((prev) => (prev + 1) % farmerStories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const textVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  // Real farmer stories data
  const farmerStories = [
    {
      id: 1,
      name: "Gopal Tamang",
      location: "Palpa Hills",
      story: "Third-generation farmer growing organic kiwi using traditional methods passed down from his grandfather. His dedication to quality has made Palpa kiwi famous across Nepal.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600",
      product: "Kiwi Chips",
      yearsFarming: 25,
      quote: "The land gives back what you put into it. We treat our soil with respect, and it rewards us with the finest fruits.",
      stat: "500+ kg monthly harvest"
    },
    {
      id: 2,
      name: "Sita Gurung",
      location: "Kaski Region",
      story: "Preserving ancient recipes for traditional Himalayan spirits. Sita learned the craft from her grandmother and now leads a cooperative of 50 women farmers.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600",
      product: "Hillside Spirits",
      yearsFarming: 18,
      quote: "Every bottle tells a story of our mountains, our culture, and our ancestors.",
      stat: "1000+ bottles monthly"
    },
    {
      id: 3,
      name: "Ram Bahadur",
      location: "Sindhupalchok",
      story: "Pioneer in organic terrace farming and sustainable agriculture. Ram transformed his village by introducing modern organic techniques while preserving traditional wisdom.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600",
      product: "Terrace Greens",
      yearsFarming: 30,
      quote: "Sustainability isn't just a buzzword. It's a way of life that ensures our children can also farm these lands.",
      stat: "200+ farmers trained"
    }
  ];

  // Company milestones
  const milestones = [
    { year: "2020", title: "The Beginning", description: "Started with 50 farmers in Palpa", icon: <Award size={24} />, color: "#10b981" },
    { year: "2021", title: "Expansion", description: "Reached 200+ farmers across Nepal", icon: <TrendingUp size={24} />, color: "#8b5cf6" },
    { year: "2022", title: "Digital Launch", description: "Launched our e-commerce platform", icon: <Globe size={24} />, color: "#f59e0b" },
    { year: "2023", title: "Impact Milestone", description: "85% revenue retained by farmers", icon: <Heart size={24} />, color: "#ef4444" },
    { year: "2024", title: "Sustainability", description: "Zero plastic packaging initiative", icon: <Leaf size={24} />, color: "#10b981" }
  ];

  // Values data
  const values = [
    { icon: <Leaf size={28} />, title: "Organic First", desc: "100% certified organic products", color: "#10b981" },
    { icon: <Truck size={28} />, title: "Fast Delivery", desc: "2-4 hour delivery in valley", color: "#8b5cf6" },
    { icon: <Users size={28} />, title: "Farmer First", desc: "85% revenue to farmers", color: "#f59e0b" },
    { icon: <Shield size={28} />, title: "Quality Assured", desc: "Strict quality control", color: "#ef4444" }
  ];

  // Stats data with real values
  const stats = [
    { value: 500, suffix: "+", label: "Local Farmers", icon: <Users size={20} /> },
    { value: 12, suffix: "H", label: "Max Delivery", icon: <Clock size={20} /> },
    { value: 85, suffix: "%", label: "Farmer Revenue", icon: <Heart size={20} /> },
    { value: 100, suffix: "%", label: "Organic", icon: <Leaf size={20} /> }
  ];

  return (
    <div className="about-us-page" ref={containerRef}>
      {/* Custom Cursor */}
      <motion.div 
        className="custom-cursor"
        animate={{ 
          x: cursorPosition.x - 10, 
          y: cursorPosition.y - 10,
          scale: hoverCard ? 1.5 : 1
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* ========== HERO SECTION ========== */}
      <section className="hero-fullscreen">
        <motion.div 
          className="hero-bg-gradient"
          style={{ y: backgroundY }}
        />
        <motion.div 
          className="hero-particles"
          animate={{ scale: heroScale }}
        />
        
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <motion.div
              initial={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
              animate={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
              transition={{ duration: 1.2, ease: [0.77, 0, 0.18, 1] }}
            >
              <h1 className="hero-title">
                <span className="hero-line">PURELY</span>
                <span className="hero-line text-outline">CULTIVATED</span>
                <span className="hero-line text-emerald">DIGITALLY SENT</span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="hero-tagline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              From the terraces of Palpa to your doorstep in hours
            </motion.p>
            
            <motion.button 
              className="hero-cta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/shop')}
            >
              Explore Collection
              <ArrowRight size={20} />
            </motion.button>
          </motion.div>
        </div>
        
        <motion.div 
          className="scroll-indicator"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <span>SCROLL</span>
        </motion.div>
      </section>

      {/* ========== STATS SECTION WITH COUNTERS ========== */}
      <section className="stats-showcase">
        <Container>
          <Row className="g-4">
            {stats.map((stat, idx) => (
              <Col md={3} sm={6} key={idx}>
                <motion.div 
                  className="stat-card-premium"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="stat-icon">{stat.icon}</div>
                  <Counter end={stat.value} suffix={stat.suffix} />
                  <span className="stat-label">{stat.label}</span>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ========== PHILOSOPHY SECTION ========== */}
      <section id="philosophy" className="section-padding">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <ParallaxImage src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1400" />
            </Col>
            <Col lg={6}>
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeInUp}>
                  <span className="eyebrow">OUR PHILOSOPHY</span>
                </motion.div>
                <motion.h2 variants={fadeInUp} className="section-title mb-4">
                  Magar Heritage, <br/> 
                  <span className="text-emerald gradient-text">Modern Logic.</span>
                </motion.h2>
                <motion.p variants={fadeInUp} className="body-text mb-4">
                  NGAU Bazaar isn't just a marketplace; it's a bridge. We've eliminated the friction between 
                  the high-altitude terraces of Palpa and the urban kitchens of Nepal.
                </motion.p>
                
                <motion.div 
                  className="stats-quote"
                  variants={fadeInUp}
                  style = {{color:"black"}}
                  whileHover={{ x: 10 }}
                >
                  <Quote size={24} className="quote-icon" />
                  <span>Harvested at 4 AM, Delivered by 4 PM.</span>
                </motion.div>
                
                <motion.div 
                  className="trust-badges"
                  variants={fadeInUp}
                >
                  <div className="badge"
                  style = {{color: "black"}}>
                    <Leaf size={16} />
                    <span>100% Organic</span>
                  </div>
                  <div className="badge"
                  style = {{color: "black"}}>
                    <Clock size={16} />
                    <span>Same Day Delivery</span>
                  </div>
                  <div className="badge"
                  style = {{color: "black"}}>
                    <Heart size={16} />
                    <span>Direct from Farmers</span>
                  </div>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ========== VALUES SECTION ========== */}
      <section className="values-section">
        <Container>
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="eyebrow">OUR VALUES</span>
            <h2 className="section-title">What We Stand For</h2>
            <p className="section-subtitle">The principles that guide everything we do</p>
          </motion.div>
          
          <Row className="g-4">
            {values.map((value, idx) => (
              <Col md={3} key={idx}>
                <motion.div 
                  className="value-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className="value-icon" style={{ backgroundColor: `${value.color}15`, color: value.color }}>
                    {value.icon}
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.desc}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ========== FARMER STORIES CAROUSEL ========== */}
      <section className="farmers-section">
        <Container>
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="eyebrow">MEET THE GROWERS</span>
            <h2 className="section-title">Our Farmer Partners</h2>
            <p className="section-subtitle">The heart behind every product</p>
          </motion.div>
          
          <div className="farmer-carousel">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeStory}
                className="farmer-story-card"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <Row className="align-items-center g-4">
                  <Col lg={5}>
                    <div className="farmer-image-wrapper">
                      <img src={farmerStories[activeStory].image} alt={farmerStories[activeStory].name} />
                      <div className="farmer-stats">
                        <div className="stat-badge">
                          <Calendar size={14} />
                          <span>{farmerStories[activeStory].yearsFarming}+ years</span>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={7}>
                    <div className="farmer-quote-icon">
                      <Quote size={48} />
                    </div>
                    <p className="farmer-quote">"{farmerStories[activeStory].quote}"</p>
                    <h3 className="farmer-name">{farmerStories[activeStory].name}</h3>
                    <div className="farmer-location">
                      <MapPin size={14} />
                      <span>{farmerStories[activeStory].location}</span>
                    </div>
                    <p className="farmer-story">{farmerStories[activeStory].story}</p>
                    <div className="farmer-product">
                      <span>Featured Product:</span>
                      <strong>{farmerStories[activeStory].product}</strong>
                    </div>
                    <div className="farmer-stat">
                      <TrendingUp size={16} />
                      <span>{farmerStories[activeStory].stat}</span>
                    </div>
                  </Col>
                </Row>
              </motion.div>
            </AnimatePresence>
            
            <div className="carousel-controls">
              <button 
                className="carousel-btn prev"
                onClick={() => setActiveStory((prev) => (prev - 1 + farmerStories.length) % farmerStories.length)}
              >
                <ChevronLeft size={24} />
              </button>
              <div className="carousel-dots">
                {farmerStories.map((_, idx) => (
                  <button
                    key={idx}
                    className={`dot ${activeStory === idx ? 'active' : ''}`}
                    onClick={() => setActiveStory(idx)}
                  />
                ))}
              </div>
              <button 
                className="carousel-btn next"
                onClick={() => setActiveStory((prev) => (prev + 1) % farmerStories.length)}
              >
                <ChevronRight size={24} />
              </button>
              <button 
                className="autoplay-btn"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* ========== THE COLLECTION - REAL PRODUCTS ========== */}
      <section className="section-padding bg-soft-dark">
        <Container>
          <motion.div 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="eyebrow">PREMIUM SELECTION</span>
            <h3 className="section-title">THE COLLECTION</h3>
            <p className="text-dim mt-3">Curated from Nepal's finest harvests</p>
          </motion.div>
          
          {loading ? (
            <div className="text-center py-5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <RefreshCw size={40} className="text-emerald" />
              </motion.div>
            </div>
          ) : (
            <Row className="g-4">
              {featuredProducts.map((product, idx) => (
                <Col md={4} key={product.id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.15, duration: 0.6 }}
                    whileHover={{ y: -15 }}
                    onMouseEnter={() => setHoverCard(product.id)}
                    onMouseLeave={() => setHoverCard(null)}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
          
          <div className="text-center mt-5">
            <motion.button 
              className="view-all-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/shop')}
            >
              View All Products
              <ArrowRight size={18} />
            </motion.button>
          </div>
        </Container>
      </section>

      {/* ========== MILESTONES TIMELINE ========== */}
      <section className="milestones-section">
        <Container>
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="eyebrow">OUR JOURNEY</span>
            <h2 className="section-title">Milestones</h2>
          </motion.div>
          
          <div className="timeline-container">
            {milestones.map((milestone, idx) => (
              <motion.div 
                key={idx}
                className="timeline-item"
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="timeline-dot" style={{ backgroundColor: milestone.color }}>
                  {milestone.icon}
                </div>
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* ========== IMPACT BENTO GRID ========== */}
      <section id="impact" className="section-padding">
        <Container>
          <motion.div 
            className="text-center mb-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="eyebrow">IMPACT METRICS</span>
            <h3 className="section-title">By The Numbers</h3>
          </motion.div>
          
          <div className="bento-layout">
            <motion.div 
              className="bento-cell bento-hero"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 0.98 }}
            >
              <span className="cell-tag">NETWORK</span>
              <div className="bento-number">500+</div>
              <p>Indigenous farmers connected via our real-time logistics grid.</p>
            </motion.div>
            
            <motion.div 
              className="bento-cell bento-accent"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 0.98 }}
            >
              <span className="cell-tag">SPEED</span>
              <div className="bento-number">12<span className="small-suffix">H</span></div>
              <p>From Soil to Kitchen.</p>
            </motion.div>
            
            <motion.div 
              className="bento-cell"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 0.98 }}
            >
              <span className="cell-tag">COMMUNITY</span>
              <div className="bento-number">85<span className="small-suffix">%</span></div>
              <p>Revenue retained by growers.</p>
            </motion.div>
            
            <motion.div 
              className="bento-cell bento-wide"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 0.98 }}
            >
              <h3 className="h2 mb-3">Sustainable Sovereignty</h3>
              <p>Eliminating middlemen to ensure the future of Himalayan agriculture.</p>
              <div className="progress-bar mt-3">
                <motion.div 
                  className="progress-fill"
                  initial={{ width: 0 }}
                  whileInView={{ width: "85%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <span className="progress-label">85% to 2025 Goal</span>
            </motion.div>
          </div>
        </Container>
      </section>
    </div>
  );
};

// Counter Component with Animation
const Counter = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 2000;
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
  }, [isInView, end]);

  return (
    <div className="counter-value" ref={ref}>
      {count}{suffix}
    </div>
  );
};

// Enhanced Parallax Component
const ParallaxImage = ({ src }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ 
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <div className="parallax-container" ref={ref}>
      <motion.img 
        style={{ y, scale }} 
        src={src} 
        alt="Farm landscape" 
      />
      <div className="parallax-overlay" />
    </div>
  );
};

export default AboutUs;