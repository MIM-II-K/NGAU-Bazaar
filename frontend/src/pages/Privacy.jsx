import React, { useEffect } from 'react';
import { Container, Row, Col, ListGroup } from 'react-bootstrap';
import '../styles/privacy-policy.css';

const PrivacyPolicy = () => {
  // Smooth scroll logic for the Table of Contents
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="privacy-page-wrapper py-5">
      <Container>
        <Row className="g-5">
          {/* Sidebar Navigation - Sticky */}
          <Col lg={3} className="d-none d-lg-block">
            <div className="sticky-sidebar">
              <h5 className="fw-bold mb-3">On this page</h5>
              <ListGroup variant="flush" className="toc-list">
                <ListGroup.Item action onClick={() => scrollToSection('intro')}>1. Introduction</ListGroup.Item>
                <ListGroup.Item action onClick={() => scrollToSection('data-collect')}>2. Data We Collect</ListGroup.Item>
                <ListGroup.Item action onClick={() => scrollToSection('data-use')}>3. How We Use Data</ListGroup.Item>
                <ListGroup.Item action onClick={() => scrollToSection('sharing')}>4. Data Sharing</ListGroup.Item>
                <ListGroup.Item action onClick={() => scrollToSection('security')}>5. Security Measures</ListGroup.Item>
                <ListGroup.Item action onClick={() => scrollToSection('rights')}>6. Your Rights</ListGroup.Item>
                <ListGroup.Item action onClick={() => scrollToSection('cookies')}>7. Cookies & AI</ListGroup.Item>
              </ListGroup>
            </div>
          </Col>

          {/* Main Content */}
          <Col lg={9}>
            <div className="policy-card p-4 p-md-5 animate-fade-in">
              <div className="text-center mb-5">
                <Badge className="mb-2 px-3 py-2 rounded-pill bg-primary-soft text-primary">Updated Feb 2026</Badge>
                <h1 className="display-5 fw-bold">Privacy Policy</h1>
                <p className="text-muted">At NGAU Bazaar, your privacy is not an afterthought—it's a core feature.</p>
              </div>

              <section id="intro" className="mb-5">
                <h3><i className="bi bi-info-circle me-2 text-primary"></i> 1. Introduction</h3>
                <p>Welcome to NGAU Bazaar. We value your trust and are committed to protecting your personal data. This policy explains how we handle your information when you use our marketplace, mobile app, and related services.</p>
              </section>

              <section id="data-collect" className="mb-5">
                <h3><i className="bi bi-database me-2 text-primary"></i> 2. Information We Collect</h3>
                <p>We collect information that allows us to provide a seamless shopping experience:</p>
                <ul>
                  <li><strong>Identity Data:</strong> Name, username, and encrypted credentials.</li>
                  <li><strong>Contact Data:</strong> Email address, billing address, and phone number.</li>
                  <li><strong>Financial Data:</strong> We use PCI-DSS compliant processors (Stripe/PayPal). We do not store full credit card numbers on our servers.</li>
                  <li><strong>Technical Data:</strong> IP address, browser type, and device identifiers.</li>
                </ul>
              </section>

              <section id="data-use" className="mb-5">
                <h3><i className="bi bi-gear me-2 text-primary"></i> 3. How We Use Your Data</h3>
                <div className="usage-grid">
                  <div className="usage-item">
                    <h6>Order Fulfillment</h6>
                    <p>Processing payments and delivering your quality goods.</p>
                  </div>
                  <div className="usage-item">
                    <h6>Personalization</h6>
                    <p>Using AI to suggest products you'll actually love.</p>
                  </div>
                </div>
              </section>

              <section id="security" className="mb-5">
                <div className="security-banner p-4 rounded-4 bg-dark text-white mb-4">
                  <h4 className="fw-bold"><i className="bi bi-shield-lock-fill me-2 text-warning"></i> Military-Grade Protection</h4>
                  <p className="mb-0 opacity-75">All data is encrypted using AES-256 standards both in transit and at rest. We conduct monthly security audits to ensure your "Bazaar" experience is safe.</p>
                </div>
              </section>

              <section id="rights" className="mb-5">
                <h3><i className="bi bi-person-check me-2 text-primary"></i> 6. Your Legal Rights</h3>
                <p>Depending on your location (GDPR/CCPA), you have the right to:</p>
                <div className="rights-pills d-flex flex-wrap gap-2">
                  <span className="badge rounded-pill border text-dark p-2 px-3">Access My Data</span>
                  <span className="badge rounded-pill border text-dark p-2 px-3">Right to Erasure</span>
                  <span className="badge rounded-pill border text-dark p-2 px-3">Portability</span>
                  <span className="badge rounded-pill border text-dark p-2 px-3">Opt-out of AI Profiling</span>
                </div>
              </section>

              <footer className="mt-5 pt-5 border-top text-center text-muted">
                <p>Questions? Contact our Data Protection Officer at <strong>privacy@ngaubazaar.com</strong></p>
              </footer>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

// Simple Badge component if not using React-Bootstrap's
const Badge = ({ children, className }) => <span className={`badge ${className}`}>{children}</span>;

export default PrivacyPolicy;