import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, useScroll, useTransform } from 'framer-motion';
import '../styles/about-us.css';

// Animation Variants for re-use
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] } }
};

const AboutUs = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="modern-about-root bg-dark-deep">
      {/* 01. ENHANCED GLASS NAV */}
      <nav className="glass-nav fixed-top px-4 px-md-5 py-3 d-flex justify-content-between align-items-center">
        <div className="brand-logo fw-bold h4 mb-0">
          <span className="text-success">NGAU</span> <span className="text-light">BAZAAR</span>
        </div>
        <div className="nav-links d-none d-md-flex gap-4 small fw-bold tracking-widest text-light-50">
          <a href="#mission" className="nav-item-link">THE MISSION</a>
          <a href="#producers" className="nav-item-link">PRODUCERS</a>
          <a href="#logistics" className="nav-item-link">LOGISTICS</a>
        </div>
      </nav>

      {/* 02. CINEMATIC HERO - ADDED DEPTH */}
      <section className="hero-viewport">
        <motion.div style={{ scale }} className="hero-bg-wrapper">
          <div className="vignette-overlay"></div>
          <img 
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1920" 
            alt="Organic Farm" 
            className="hero-img"
          />
        </motion.div>
        
        <Container className="h-100 position-relative d-flex align-items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            style={{ opacity }}
            className="hero-content"
          >
            <h6 className="text-uppercase tracking-widest mb-3 text-success fw-bold">Hyper-Local Logistics</h6>
            <h1 className="editorial-display text-white">
              Honest Food <br/> 
              <span className="text-gradient">Direct From</span> <br/> 
              <span className="outline-text">The Soil.</span>
            </h1>
            <div className="scroll-indicator mt-5">
              <motion.div 
                animate={{ y: [0, 10, 0] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="mouse-icon"
              />
              <span className="small tracking-widest ms-3 text-light-50">SCROLL TO DISCOVER</span>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* 03. PHILOSOPHY - ASYMMETRIC & ANIMATED */}
      <section id="mission" className="philosophy-grid py-10">
        <Container>
          <Row className="align-items-center mb-10">
            <Col lg={5} className="mb-5 mb-lg-0">
              <motion.div 
                initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                transition={{ duration: 1.2, ease: "circOut" }}
                className="image-reveal-wrapper"
              >
                <img src="https://images.unsplash.com/photo-1488459711635-de8296fe303b?auto=format&fit=crop&w=800" className="img-fluid rounded-4 shadow-2xl" alt="Organic" />
              </motion.div>
            </Col>
            <Col lg={{ span: 6, offset: 1 }}>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
                <span className="text-success fw-bold tracking-widest">01 / OUR PURPOSE</span>
                <h2 className="display-4 fw-bold mt-3 mb-4 text-white">Eliminating the <br/> Middleman Fatigue.</h2>
                <p className="lead text-light-50 border-start border-2 ps-4 border-success">
                  Traditional supply chains waste 30% of fresh produce. We use 
                  predictive data to harvest only what is ordered, ensuring 
                  <span className="text-white"> zero-waste </span> and maximum nutrient density.
                </p>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 04. DATA TRANSPARENCY - GLASS CARDS */}
      <section className="data-transparency py-10">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold h1 text-white">Transparency in <span className="text-success">Numbers</span></h2>
          </div>
          <Row className="g-4">
            {[
              { title: "Network", val: "500+", sub: "Regional Farmers" },
              { title: "Impact", val: "1.2M", sub: "KG Plastic Saved" },
              { title: "Time", val: "<12h", sub: "Farm to Door" },
              { title: "Quality", val: "A++", sub: "Organic Certified" }
            ].map((stat, i) => (
              <Col md={3} key={i}>
                <motion.div 
                  whileHover={{ y: -10 }}
                  className="glass-card p-5 text-center h-100"
                >
                  <h3 className="display-5 fw-bold text-success mb-1">{stat.val}</h3>
                  <p className="text-uppercase tracking-widest small mb-2 fw-bold text-white">{stat.title}</p>
                  <small className="text-light-50">{stat.sub}</small>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutUs;