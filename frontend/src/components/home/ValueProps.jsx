import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

const AnimatedCounter = ({ end, suffix = "", duration = 2000, label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      let startTime;
      
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const percentage = Math.min(progress / duration, 1);
        const currentCount = Math.floor(percentage * end);

        setCount(currentCount);

        if (percentage < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
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

const ValueProps = ({ statsRef }) => {
  return (
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
  );
};

export default ValueProps;