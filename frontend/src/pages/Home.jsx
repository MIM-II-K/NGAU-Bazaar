import { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/home.css';

const Home = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section bg-dark text-white py-5 overflow-hidden">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6} data-aos="fade-right">
              <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill">Premium Marketplace</Badge>
              <h1 className="display-2 fw-bold mb-4">
                Elevate Your Shopping <span className="text-primary">Experience.</span>
              </h1>
              <p className="lead text-light text-opacity-75 mb-5">
                NGAU Bazaar offers the most exclusive collection of digital and physical goods with lightning-fast delivery and top-tier security.
              </p>
              
              <div className="d-flex gap-3 flex-wrap">
                {isAuthenticated() ? (
                  <>
                    <Button as={Link} to="/shop" variant="primary" size="lg" className="px-4 py-3 rounded-pill fw-bold">
                      <i className="bi bi-cart3"></i> Start Shopping
                    </Button>
                    <Button 
                      as={Link} 
                      to={isAdmin() ? "/admin" : "/dashboard"} 
                      variant="outline-light" 
                      size="lg" 
                      className="px-4 py-3 rounded-pill fw-bold"
                    >
                      <i className={`bi ${isAdmin() ? 'bi-shield-lock' : 'bi-speedometer2'} me-2`}></i>
                      {isAdmin() ? 'Command Center' : 'My Dashboard'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button as={Link} to="/register" variant="primary" size="lg" className="px-4 py-3 rounded-pill fw-bold">
                      Get Started Free
                    </Button>
                    <Button as={Link} to="/login" variant="outline-light" size="lg" className="px-4 py-3 rounded-pill fw-bold">
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </Col>
            <Col lg={6} className="text-center mt-5 mt-lg-0" data-aos="zoom-in">
              <div className="hero-icon-blob">
                <i className="bi bi-cart3 text-primary display-1"></i>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="features-section py-5">
        <Container className="py-5">
          <div className="text-center mb-5" data-aos="fade-up">
            <h2 className="fw-bold display-5">Why Choose Us?</h2>
            <p className="text-muted">Built for reliability, designed for speed.</p>
          </div>
          <Row className="g-4">
            {[
              { icon: 'bi-truck', title: 'Global Shipping', color: 'primary', desc: 'Secure delivery to over 150 countries within 3-5 business days.' },
              { icon: 'bi-shield-lock', title: 'Vault Security', color: 'success', desc: 'Your transactions are protected by bank-grade 256-bit encryption.' },
              { icon: 'bi-headset', title: '24/7 Support', color: 'info', desc: 'Our dedicated support team is available around the clock to assist you.' }
            ].map((f, i) => (
              <Col md={4} key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                <Card className="h-100 border-0 shadow-sm hover-up p-4">
                  <Card.Body>
                    <div className={`feature-icon mb-4 bg-${f.color} bg-opacity-10 text-${f.color}`}>
                      <i className={`bi ${f.icon} h2`}></i>
                    </div>
                    <Card.Title className="fw-bold">{f.title}</Card.Title>
                    <Card.Text className="text-muted">{f.desc}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;