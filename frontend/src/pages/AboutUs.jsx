import React, { useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import '../styles/about-us.css';

const AboutUs = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Animation Variants
  const textVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] } 
    }
  };

  return (
    <div className="bg-obsidian" ref={containerRef}>

      {/* 02. HERO SECTION - High Impact */}
      <section className="hero-fullscreen">
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
           <h1 className="hero-title">
              PURELY <br />
              <span className="text-outline">CULTIVATED</span> <br />
              <span className="text-emerald">DIGITALLY</span> SENT.
            </h1>
          </motion.div>
        </div>
        <div className="scroll-indicator">
            <div className="mouse"></div>
        </div>
      </section>

      {/* 03. PHILOSOPHY SECTION */}
      <section id="soil" className="section-padding">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="pe-lg-5">
              <ParallaxImage src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1400" />
            </Col>
            <Col lg={6} className="ps-lg-5 mt-5 mt-lg-0">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={textVariant}>
                <h2 className="section-title mb-4">Magar Heritage, <br/> <span className="text-emerald">Modern Logic.</span></h2>
                <p className="body-text mb-4">
                  NGAU Bazaar isn't just a marketplace; it's a bridge. We've eliminated the friction between the high-altitude terraces of Palpa and the urban kitchens of Nepal.
                </p>
                <div className="stats-quote">
                  "Harvested at 4 AM, Delivered by 4 PM."
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 04. PRODUCT CARDS - Premium Cards */}
      <section className="section-padding bg-soft-dark">
        <Container>
          <div className="mb-5">
            <h3 className="section-title text-center">THE COLLECTION</h3>
          </div>
          <Row className="g-4">
            {[
              { title: "Kiwi Chips", img: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800", cat: "DEHYDRATED" },
              { title: "Hillside Spirits", img: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&w=800", cat: "TRADITIONAL" },
              { title: "Terrace Greens", img: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?auto=format&fit=crop&w=800", cat: "ORGANIC" }
            ].map((item, idx) => (
              <Col md={4} key={idx}>
                <motion.div 
                  className="product-card"
                  whileHover={{ y: -15 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="card-img-wrapper">
                    <img src={item.img} alt={item.title} />
                    <div className="card-overlay">
                      <span>VIEW ORIGIN</span>
                    </div>
                  </div>
                  <div className="card-details">
                    <span className="category">{item.cat}</span>
                    <h4>{item.title}</h4>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* 05. BENTO METRICS - Dynamic Sizes */}
      <section id="impact" className="section-padding">
        <Container>
          <div className="bento-layout">
            <div className="bento-cell bento-hero">
              <span className="cell-tag">NETWORK</span>
              <h3 className="display-huge">500+</h3>
              <p>Indigenous farmers connected via our real-time logistics grid.</p>
            </div>
            <div className="bento-cell bento-accent">
              <span className="cell-tag">SPEED</span>
              <h3 className="display-med">12H</h3>
              <p>From Soil to Kitchen.</p>
            </div>
            <div className="bento-cell">
              <span className="cell-tag">COMMUNITY</span>
              <h3 className="display-med">85%</h3>
              <p>Revenue retained by growers.</p>
            </div>
            <div className="bento-cell bento-wide">
              <h3 className="h2 mb-3" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Sustainable Sovereignty</h3>
              <p>Eliminating middlemen to ensure the future of Himalayan agriculture.</p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

// Helper Component for Parallax
const ParallaxImage = ({ src }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [-100, 100]);

  return (
    <div className="parallax-container" ref={ref}>
      <motion.img style={{ y }} src={src} alt="Farm" />
    </div>
  );
};

export default AboutUs;