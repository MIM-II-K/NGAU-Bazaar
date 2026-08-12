import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import { ShoppingBag, Truck, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-banner">
      <Container>
        <Row className="align-items-center">
          <Col lg={6}>
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="hero-tag">
                Farm Fresh • Same Day Delivery
              </span>

              <h1>
                Fresh Groceries
                <br />
                Delivered To
                <br />
                Your Doorstep
              </h1>

              <p>
                Buy directly from local farmers and producers.
                Organic vegetables, fruits, grains and traditional foods.
              </p>

              <div className="hero-actions">
                <button
                  className="hero-btn-primary"
                  onClick={() => navigate("/shop")}
                >
                  <ShoppingBag size={18} />
                  Shop Now
                </button>

                <button
                  className="hero-btn-secondary"
                  onClick={() => navigate("/categories")}
                >
                  Browse Categories
                </button>
              </div>

              <div className="hero-features">
                <span><Truck size={16} /> Same Day Delivery</span>
                <span><Leaf size={16} /> Organic Produce</span>
              </div>
            </motion.div>
          </Col>

          <Col lg={6}>
            <img
              src="/images/hero-banner.jpg"
              alt="Fresh groceries"
              className="hero-image"
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroBanner;