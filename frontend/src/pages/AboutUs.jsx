import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, useScroll, useTransform } from 'framer-motion';
import '../styles/about-us.css';

const AboutUs = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <div className="modern-about-root">
      {/* 01. FIXED NAVIGATION BAR (MINIMAL) */}
      <nav className="glass-nav px-5 py-4 d-flex justify-content-between align-items-center">
        <div className="brand-logo fw-bold h4 mb-0 text-success">NGAU <span className="text-dark">BAZAAR</span></div>
        <div className="nav-links d-none d-md-flex gap-4 small fw-semibold tracking-widest">
          <span>THE MISSION</span> / <span>PRODUCERS</span> / <span>LOGISTICS</span>
        </div>
      </nav>

      {/* 02. CINEMATIC HERO */}
      <section className="hero-viewport overflow-hidden">
        <motion.div style={{ scale }} className="hero-bg-wrapper">
          <div className="overlay-dark"></div>
          <img src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1920" alt="Farm" />
        </motion.div>
        
        <Container className="h-100 position-relative d-flex align-items-center">
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="hero-content text-white"
          >
            <h6 className="text-uppercase tracking-widest mb-3 text-success fw-bold">Hyper-Local Logistics</h6>
            <h1 className="editorial-display">Honest Food <br/> Direct From <br/> <span className="outline-text">The Soil.</span></h1>
            <div className="scroll-indicator mt-5">
              <div className="mouse-icon"></div>
              <span className="small tracking-widest ms-3">SCROLL TO DISCOVER</span>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* 03. THE "WHY" - ASYMMETRIC GRID */}
      <section className="philosophy-grid py-10 bg-white">
        <Container>
          <Row className="align-items-center mb-10">
            <Col lg={5} className="mb-5 mb-lg-0">
              <div className="image-reveal-container">
                <motion.div 
                  initial={{ height: "100%" }}
                  whileInView={{ height: "0%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="reveal-curtain bg-dark"
                />
                <img src="https://images.unsplash.com/photo-1488459711635-de8296fe303b?auto=format&fit=crop&w=800" className="img-fluid rounded-2 shadow-lg" alt="Organic" />
              </div>
            </Col>
            <Col lg={{ span: 6, offset: 1 }}>
              <span className="text-muted fw-bold">01 / OUR PURPOSE</span>
              <h2 className="display-4 fw-bold mt-3 mb-4">Eliminating the <br/> Middleman Fatigue.</h2>
              <p className="lead text-secondary border-start border-3 ps-4 border-success">
                Traditional supply chains waste 30% of fresh produce before it hits the shelf. 
                We use predictive data to harvest only what is ordered, ensuring 
                zero-waste and maximum nutrient density.
              </p>
            </Col>
          </Row>

          <Row className="flex-row-reverse align-items-center">
            <Col lg={5} className="mb-5 mb-lg-0">
              <div className="image-reveal-container">
                <motion.div 
                  initial={{ height: "100%" }}
                  whileInView={{ height: "0%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="reveal-curtain bg-success"
                />
                <img src="https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=800" className="img-fluid rounded-2 shadow-lg" alt="Logistics" />
              </div>
            </Col>
            <Col lg={6}>
              <span className="text-muted fw-bold">02 / THE ECOSYSTEM</span>
              <h2 className="display-4 fw-bold mt-3 mb-4">Biodegradable <br/> By Design.</h2>
              <p className="lead text-secondary border-start border-3 ps-4 border-success">
                Every carrier, crate, and label in our system is either reusable 
                or fully compostable. We don't just deliver food; we protect 
                the land that grows it.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 04. THE VALUES - BRUTALIST TILES */}
      <section className="values-marquee bg-dark py-5 overflow-hidden">
        <div className="d-flex marquee-content">
          {[...Array(6)].map((_, i) => (
            <h2 key={i} className="text-white opacity-25 display-1 fw-bold px-4 mb-0">
              ORGANIC • ETHICAL • TRANSPARENT • LOCAL •
            </h2>
          ))}
        </div>
      </section>

      {/* 05. DETAILED DATA SECTION */}
      <section className="data-transparency py-10 bg-light">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold h1">Transparency in Numbers</h2>
          </div>
          <Row className="g-0 border border-secondary shadow-sm">
            {[
              { title: "Network", val: "500+", sub: "Regional Farmers" },
              { title: "Impact", val: "1.2M", sub: "KG Plastic Saved" },
              { title: "Time", val: "<12h", sub: "Farm to Door" },
              { title: "Quality", val: "A++", sub: "Organic Certified" }
            ].map((stat, i) => (
              <Col md={3} key={i} className={`p-5 text-center ${i < 3 ? 'border-end-md' : ''} border-bottom-md`}>
                <h3 className="display-5 fw-bold text-success mb-1">{stat.val}</h3>
                <p className="text-uppercase tracking-widest small mb-0 fw-bold">{stat.title}</p>
                <small className="text-muted">{stat.sub}</small>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default AboutUs;