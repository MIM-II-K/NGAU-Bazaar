import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Truck, Leaf, Users } from 'lucide-react';

const SeasonalBanner = () => {
  const benefits = [
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
  ];

  return (
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
          {benefits.map((benefit, idx) => (
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
  );
};

export default SeasonalBanner;