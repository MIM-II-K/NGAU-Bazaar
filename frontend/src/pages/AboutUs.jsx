import React, { useEffect, useRef, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Truck,
  Clock,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
  Zap,
  Heart,
  MapPin,
  Quote,
  ChevronRight,
  Play,
  Pause,
  Globe,
  Calendar,
  Target,
  Eye,
  ChevronLeft,
  Sparkles,
  Sprout,
  Gem,
  Crown,
  Award,
  Building2,
  Handshake,
  BarChart3,
  Smartphone,
  Store,
  Wifi,
  Coins,
  Sun,
  Droplets,
  Coffee,
  ShoppingBag,
  CheckCircle,
  RefreshCw,
  Infinity,
  Network,
  Rocket
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
  const [loading, setLoading] = useState(true);
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.98]);

  // Fetch real products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const products = await productApi.getAll({ page: 1, limit: 3, sort: 'popularity' });
        setFeaturedProducts(Array.isArray(products) ? products : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-rotate milestones
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveMilestone((prev) => (prev + 1) % roadmapMilestones.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Mouse move effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Roadmap milestones from content
  const roadmapMilestones = [
    {
      phase: "The Seed",
      timeline: "Early 2026",
      description: "Identifying the gap between Palpa's local producers and urban demand.",
      icon: <Sprout size={24} />,
      color: "#10b981"
    },
    {
      phase: "Development",
      timeline: "Mid 2026 – Present",
      description: "Building a robust ecosystem to handle logistics from soil to shelf.",
      icon: <Building2 size={24} />,
      color: "#8b5cf6"
    },
    {
      phase: "The Launch",
      timeline: "Mid 2027",
      description: "Grand Launch of our dedicated web platform and mobile application.",
      icon: <Rocket size={24} />,
      color: "#f59e0b"
    }
  ];

  // Advantages data
  const advantages = [
    {
      icon: <Sun size={28} />,
      title: "Unmatched Peak Freshness",
      description: "Soil-to-shelf model minimizes time between harvest and delivery. No weeks of cold storage.",
      color: "#f59e0b"
    },
    {
      icon: <Leaf size={28} />,
      title: "Guaranteed Organic Integrity",
      description: "Direct from Dholimara ecosystem with traditional, chemical-free methods upheld.",
      color: "#10b981"
    },
    {
      icon: <Handshake size={28} />,
      title: "Direct Farmer Empowerment",
      description: "No 'middleman tax' — farmers transition from survival to dignified, viable profession.",
      color: "#8b5cf6"
    },
    {
      icon: <TrendingUp size={28} />,
      title: "Local Economic Growth",
      description: "Every rupee stays within Palpa and Butwal corridor, funding local infrastructure.",
      color: "#ec4899"
    },
    {
      icon: <Eye size={28} />,
      title: "Radical Transparency",
      description: "Know exactly where your food was grown, the climate it thrived in, and the community you support.",
      color: "#06b6d4"
    }
  ];

  // Stats data
  const stats = [
    { value: 100, suffix: "%", label: "Organic Guarantee", icon: <Leaf size={24} />, delay: 0 },
    { value: 24, suffix: "H", label: "Farm to Table", icon: <Clock size={24} />, delay: 0.1 },
    { value: 0, suffix: "", label: "Middlemen", icon: <Users size={24} />, delay: 0.2 },
    { value: 100, suffix: "%", label: "Farmer Revenue", icon: <Heart size={24} />, delay: 0.3 }
  ];

  // Values data
  const values = [
    { icon: <Leaf size={28} />, title: "Organic First", desc: "100% certified organic from Dholimara", color: "#10b981" },
    { icon: <Handshake size={28} />, title: "Farmer First", desc: "Full value to those who work the land", color: "#8b5cf6" },
    { icon: <Shield size={28} />, title: "Radical Transparency", desc: "Know your food's journey", color: "#f59e0b" },
    { icon: <Globe size={28} />, title: "Local Economy", desc: "Every rupee stays in the community", color: "#ec4899" }
  ];

  // Featured products from Dholimara
  const dholimaraProducts = [
    { name: "Palpa Ginger", description: "Known for its exceptional aroma and medicinal properties", icon: <Sprout size={20} /> },
    { name: "Himalayan Coffee", description: "Rich, bold flavor from high-altitude cultivation", icon: <Coffee size={20} /> },
    { name: "Wild Honey", description: "Raw, unfiltered honey from native bees", icon: <Sun size={20} /> }
  ];

  return (
    <div className="about-us-redesign" ref={containerRef}>
      {/* Background Elements */}
      <div className="bg-elements">
        <div className="bg-glow glow-1" />
        <div className="bg-glow glow-2" />
        <div className="bg-glow glow-3" />
      </div>

      {/* ========== HERO SECTION ========== */}
      <section className="hero-modern">
        <motion.div
          className="hero-bg"
          style={{ y: backgroundY }}
        />

        <div className="hero-container">
          <motion.div
            className="hero-content-modern"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
          >
            <motion.h1
              className="hero-title-modern"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="title-line">Purely Organic</span>
              <span className="title-line gradient-text"> From Our Hills</span>
            </motion.h1>

            <motion.p
              className="hero-description"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Bringing the farm to your front door. Cutting out middlemen to ensure farmers
              receive full value while you gain access to organic harvests at peak freshness.
            </motion.p>

            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.button
                className="btn-primary-modern"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/shop')}
              >
                Start Shopping
                <ArrowRight size={18} />
              </motion.button>
              <motion.button
                className="btn-secondary-modern"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Our Mission
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== MISSION SECTION ========== */}
      <section id="mission" className="mission-section">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <motion.div
                className="mission-content"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="section-badge">
                  <Target size={16} />
                  <span>Our Mission</span>
                </div>
                <h2 className="mission-title">
                  Bringing the Farm<br />
                  <span className="gradient-text">to Your Front Door</span>
                </h2>
                <p className="mission-text">
                  At NGAU Bazaar, we believe that the journey from the soil to the table should be a straight line,
                  defined by respect rather than interference. Born in the rugged, fertile landscapes of
                  <strong> Dholimara, Palpa</strong>, our mission is to dismantle the traditional supply chains that
                  have long separated the producer from the person they nourish.
                </p>
                <p className="mission-text">
                  By cutting out the middlemen who dilute both the farmer's profit and the produce's vitality,
                  we ensure that those who work the land receive the full value of their labor while families
                  in the city gain access to local, organic harvests at their peak nutritional density.
                </p>
                <div className="mission-quote">
                  <Quote size={28} />
                  <p>Transforming grocery shopping into a meaningful connection — empowering rural entrepreneurs with every transaction.</p>
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                className="mission-image-wrapper"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="image-frame">
                  <img
                    src="https://punvzbjvgphhjcgsgzhd.supabase.co/storage/v1/object/public/profiles/dholimara.jpg?auto=format&fit=crop&w=1200"
                    alt="Terraced farming in Palpa, Nepal"
                  />
                  <div className="image-accent" />
                </div>
                <div className="floating-card">
                  <MapPin size={18} />
                  <span>Dholimara, Palpa</span>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ========== PROBLEM SECTION ========== */}
      <section className="problem-section">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={5}>
              <motion.div
                className="problem-stats"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="stat-circle">
                  <span className="stat-number">80%</span>
                  <span className="stat-label">of retail price goes to middlemen</span>
                </div>
                <div className="stat-circle">
                  <span className="stat-number">7+</span>
                  <span className="stat-label">days from farm to traditional market</span>
                </div>
              </motion.div>
            </Col>
            <Col lg={7}>
              <motion.div
                className="problem-content"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="section-badge">
                  <Shield size={16} />
                  <span>The Problem We're Solving</span>
                </div>
                <h2 className="problem-title">For too long, farmers received the smallest slice of the pie</h2>
                <div className="problem-list">
                  <div className="problem-item">
                    <div className="problem-icon">
                      <Sprout size={24} strokeWidth={1.5} className="text-green-500" />
                    </div>
                    <div>
                      <h4>Farmers</h4>
                      <p>Receive the full reward for their hard work — no more exploitation</p>
                    </div>
                  </div>

                  <div className="problem-item">
                    <div className="problem-icon">
                      <ShoppingBag size={24} strokeWidth={1.5} className="text-blue-500" />
                    </div>
                    <div>
                      <h4>Consumers</h4>
                      <p>Get access to organic, local, and 100% fresh produce</p>
                    </div>
                  </div>

                  <div className="problem-item">
                    <div className="problem-icon">
                      <Eye size={24} strokeWidth={1.5} className="text-purple-500" />
                    </div>
                    <div>
                      <h4>Transparency</h4>
                      <p>Is at the core of every transaction — know your food's journey</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ========== STATS SECTION ========== */}
      <section className="stats-section">
        <Container>
          <Row className="g-4 justify-content-center">
            {stats.map((stat, idx) => (
              <Col lg={3} md={6} key={idx}>
                <motion.div
                  className="stat-card-modern"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: stat.delay, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="stat-icon-modern">{stat.icon}</div>
                  <CounterModern end={stat.value} suffix={stat.suffix} />
                  <span className="stat-label-modern">{stat.label}</span>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ========== ADVANTAGES SECTION ========== */}
      <section className="advantages-section">
        <Container>
          <motion.div
            className="section-header-modern"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-badge">
              <Crown size={16} />
              <span>Why NGAU Bazaar?</span>
            </div>
            <h2 className="section-title-modern">The NGAU Advantage</h2>
            <p className="section-subtitle-modern">A fundamental shift in how we value food</p>
          </motion.div>

          <Row className="g-4">
            {advantages.map((adv, idx) => (
              <Col lg={4} md={6} key={idx}>
                <motion.div
                  className="advantage-card"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="advantage-icon" style={{ backgroundColor: `${adv.color}15`, color: adv.color }}>
                    {adv.icon}
                  </div>
                  <h3>{adv.title}</h3>
                  <p>{adv.description}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ========== ROADMAP SECTION ========== */}
      <section className="roadmap-section">
        <Container>
          <motion.div
            className="section-header-modern"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-badge">
              <Calendar size={16} />
              <span>Our Journey</span>
            </div>
            <h2 className="section-title-modern">The Roadmap</h2>
            <p className="section-subtitle-modern">From soil to shelf — our path forward</p>
          </motion.div>

          <div className="roadmap-carousel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMilestone}
                className="roadmap-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <div className="roadmap-phase" style={{ backgroundColor: roadmapMilestones[activeMilestone].color }}>
                  {roadmapMilestones[activeMilestone].icon}
                  <span>{roadmapMilestones[activeMilestone].phase}</span>
                </div>
                <div className="roadmap-timeline">{roadmapMilestones[activeMilestone].timeline}</div>
                <p className="roadmap-description">{roadmapMilestones[activeMilestone].description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="roadmap-controls">
              <button
                className="roadmap-btn"
                onClick={() => setActiveMilestone((prev) => (prev - 1 + roadmapMilestones.length) % roadmapMilestones.length)}
              >
                <ChevronLeft size={20} />
              </button>
              <div className="roadmap-dots">
                {roadmapMilestones.map((_, idx) => (
                  <button
                    key={idx}
                    className={`roadmap-dot ${activeMilestone === idx ? 'active' : ''}`}
                    onClick={() => setActiveMilestone(idx)}
                    style={{ backgroundColor: activeMilestone === idx ? roadmapMilestones[idx].color : 'rgba(0,0,0,0.2)' }}
                  />
                ))}
              </div>
              <button
                className="roadmap-btn"
                onClick={() => setActiveMilestone((prev) => (prev + 1) % roadmapMilestones.length)}
              >
                <ChevronRight size={20} />
              </button>
              <button
                className="autoplay-btn"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* ========== FUTURE VISION SECTION ========== */}
      <section className="vision-section">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <motion.div
                className="vision-content"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="section-badge">
                  <Rocket size={16} />
                  <span>Looking Ahead</span>
                </div>
                <h2 className="vision-title">
                  The Multi-Vendor<br />
                  <span className="gradient-text">Ecosystem</span>
                </h2>
                <p className="vision-text">
                  While we began as a managed service to ensure gold standard quality, our ultimate vision
                  is to decentralize the marketplace. We are architecting a transition into a
                  <strong> dynamic Multi-Vendor Ecosystem</strong> where the platform evolves into a powerful
                  digital toolkit, handing the keys of commerce directly to the farmers.
                </p>
                <div className="vision-features">
                  <div className="vision-feature">
                    <Smartphone size={20} />
                    <div>
                      <h4>Manage Digital Inventory</h4>
                      <p>Real-time control over specific yields</p>
                    </div>
                  </div>
                  <div className="vision-feature">
                    <Network size={20} />
                    <div>
                      <h4>Track Logistics</h4>
                      <p>Monitor orders from the palm of their hand</p>
                    </div>
                  </div>
                  <div className="vision-feature">
                    <Coins size={20} />
                    <div>
                      <h4>Financial Sovereignty</h4>
                      <p>Direct access to paychecks and growth metrics</p>
                    </div>
                  </div>
                  <div className="vision-feature">
                    <Handshake size={20} />
                    <div>
                      <h4>Direct Interaction</h4>
                      <p>Subscribe to the journey of a specific farm</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                className="vision-image"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="vision-grid">
                  <div className="vision-card">
                    <Store size={32} />
                    <span>Digital Storefronts</span>
                  </div>
                  <div className="vision-card">
                    <Wifi size={32} />
                    <span>Real-Time Tracking</span>
                  </div>
                  <div className="vision-card">
                    <BarChart3 size={32} />
                    <span>Growth Analytics</span>
                  </div>
                  <div className="vision-card">
                    <Users size={32} />
                    <span>Community Building</span>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ========== QUALITY PROMISE SECTION ========== */}
      <section className="quality-section">
        <Container>
          <Row className="g-5 align-items-center">
            <Col lg={5}>
              <motion.div
                className="quality-products"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3>The Palpa Connection</h3>
                {dholimaraProducts.map((product, idx) => (
                  <motion.div
                    key={idx}
                    className="product-tag"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {product.icon}
                    <div>
                      <strong>{product.name}</strong>
                      <span>{product.description}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </Col>
            <Col lg={7}>
              <motion.div
                className="quality-content"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="section-badge">
                  <Award size={16} />
                  <span>Our Quality Promise</span>
                </div>
                <h2 className="quality-title">
                  The "Seed-to-Sack"<br />
                  <span className="gradient-text">Guarantee</span>
                </h2>
                <p className="quality-text">
                  By eliminating the carbon footprint of industrial transport and the waste of long-term storage,
                  we ensure a sustainable future for the land and a healthier lifestyle for the individual.
                </p>
                <div className="quality-badges">
                  <div className="quality-badge">
                    <Leaf size={20} />
                    <span>100% Chemical-Free</span>
                  </div>
                  <div className="quality-badge">
                    <Clock size={20} />
                    <span>Peak Harvest Freshness</span>
                  </div>
                  <div className="quality-badge">
                    <MapPin size={20} />
                    <span>Traceable Origin</span>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ========== VALUES SECTION ========== */}
      <section className="values-section-modern">
        <Container>
          <motion.div
            className="section-header-modern"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-badge">
              <Gem size={16} />
              <span>Core Values</span>
            </div>
            <h2 className="section-title-modern">What We Stand For</h2>
            <p className="section-subtitle-modern">Principles that guide our digital bridge</p>
          </motion.div>

          <Row className="g-4">
            {values.map((value, idx) => (
              <Col lg={3} md={6} key={idx}>
                <motion.div
                  className="value-card-modern"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <div className="value-icon-modern" style={{ backgroundColor: `${value.color}15`, color: value.color }}>
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

      {/* ========== FEATURED PRODUCTS ========== */}
      <section className="products-section">
        <Container>
          <motion.div
            className="section-header-modern"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="section-badge">
              <ShoppingBag size={16} />
            </div>
            <h2 className="section-title-modern">Featured Harvests</h2>
            <p className="section-subtitle-modern">Experience the authentic taste of Palpa</p>
          </motion.div>

          {loading ? (
            <div className="loading-spinner">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <RefreshCw size={48} />
              </motion.div>
            </div>
          ) : (
            <Row className="g-4">
              {featuredProducts.map((product, idx) => (
                <Col lg={4} md={6} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    whileHover={{ y: -10 }}
                    onMouseEnter={() => setHoverCard(product.id)}
                    onMouseLeave={() => setHoverCard(null)}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}

          <motion.div
            className="view-all-container"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="view-all-btn-modern"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/shop')}
            >
              Explore All Products
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>
        </Container>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="cta-section">
        <Container>
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="cta-content">
              <h2>Ready to Taste the Difference?</h2>
              <p>Join the movement that's transforming how Nepal eats. Fresh, organic, and direct from Dholimara.</p>
              <motion.button
                className="cta-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/shop')}
              >
                Start Your Journey
                <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
};

// Modern Counter Component
const CounterModern = ({ end, suffix = "" }) => {
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
    <div className="counter-modern" ref={ref}>
      {count}{suffix}
    </div>
  );
};

export default AboutUs;