import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import '../styles/contact-us.css';

const ContactUs = () => {
  return (
    <Container className="py-5">
      <Row className="align-items-center">
        <Col lg={5} className="mb-5 mb-lg-0">
          <div className="contact-info-panel">
            <h2 className="fw-bold mb-4">Let's Connect</h2>
            <div className="info-item d-flex align-items-center mb-4">
              <div className="icon-circle me-3"><i className="bi bi-geo-alt"></i></div>
              <div><h6>Our Location</h6><p className="text-muted mb-0">Jalpa, Dholimara, Palpa, Nepal</p></div>
            </div>
            <div className="info-item d-flex align-items-center">
              <div className="icon-circle me-3"><i className="bi bi-headset"></i></div>
              <div><h6>24/7 Support</h6><p className="text-muted mb-0">+977 (9762533455) NGAU-HELP</p></div>
            </div>
          </div>
        </Col>
        <Col lg={7}>
          <div className="glass-form-card p-5 shadow-sm">
            <Form>
              <Row>
                <Col md={6} className="mb-3"><Form.Control placeholder="First Name" className="modern-input" /></Col>
                <Col md={6} className="mb-3"><Form.Control placeholder="Last Name" className="modern-input" /></Col>
              </Row>
              <Form.Group className="mb-3"><Form.Control type="email" placeholder="Email Address" className="modern-input" /></Form.Group>
              <Form.Group className="mb-3"><Form.Control as="textarea" rows={4} placeholder="How can we help?" className="modern-input" /></Form.Group>
              <Button variant="primary" className="w-100 py-3 rounded-pill fw-bold glow-button">Send Message</Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactUs;