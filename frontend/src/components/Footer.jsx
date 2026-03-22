import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import '../styles/footer.css'

const Footer = () => {
  return (
    <footer className="footer-main">
      <Container>
        <Row className="gy-5">
          {/* Brand Section */}
          <Col lg={4} md={12}>
            <div className="footer-brand mb-3">
              <img src="/logo_b.png" alt="Logo" className="footer-logo me-2" />
              <Link to="/shop" className="brand-link">
                <strong><span className="brand-name">NGAU<span className="text-primary">BAZAAR</span></span></strong>
              </Link>
            </div>
            <p className="footer-desc">
              The premier marketplace for quality goods. Bridging the gap between 
              local sellers and global buyers with security and ease.
            </p>
            <div className="social-links d-flex gap-3 mt-4">
              <a href="#"><i className="bi bi-facebook"></i></a>
              <a href="#"><i className="bi bi-twitter-x"></i></a>
              <a href="#"><i className="bi bi-instagram"></i></a>
              <a href="#"><i className="bi bi-linkedin"></i></a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={4} sm={6}>
            <h5 className="footer-title">Platform</h5>
            <ul className="footer-links">
              <li><Link to="/shop">Shop</Link></li>
              <li><Link to="/flash-deals">Flash Deals</Link></li>
              <li><Link to="/dashboard">Profile</Link></li>
              <li><Link to="/about-us">About us</Link></li>
            </ul>
          </Col>

          {/* Support Section */}
          <Col lg={2} md={4} sm={6}>
            <h5 className="footer-title">Support</h5>
            <ul className="footer-links">
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </Col>

          {/* Newsletter Section */}
          <Col lg={4} md={4}>
            <h5 className="footer-title">Stay Updated</h5>
            <p className="small text-muted">Subscribe to get the latest product drops and discounts.</p>
            <Form className="newsletter-form mt-3">
              <div className="newsletter-group">
                <Form.Control 
                  type="email" 
                  placeholder="Enter email" 
                  className="newsletter-input"
                />
                <Button variant="primary" className="newsletter-btn">
                  Join
                </Button>
              </div>
            </Form>
          </Col>
        </Row>

        <hr className="footer-divider" />

        <Row className="py-4 align-items-center">
          <Col md={6} className="text-center text-md-start">
            <p className="mb-0 text-muted small">
              © 2026 NGAU Bazaar. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end mt-3 mt-md-0">
            <div className="payment-icons gap-3 d-flex justify-content-center justify-content-md-end">
              <i className="bi bi-credit-card"></i>
              <i className="bi bi-paypal"></i>
              <i className="bi bi-wallet2"></i>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer