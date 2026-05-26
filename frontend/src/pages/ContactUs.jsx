import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import '../styles/contact-us.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        return !value.trim() ? 'First name is required' : '';
      case 'lastName':
        return !value.trim() ? 'Last name is required' : '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Invalid email address' : '';
      case 'message':
        return !value.trim() ? 'Message is required' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error on typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear submit status when user starts typing
    if (submitStatus.message) {
      setSubmitStatus({ type: '', message: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus({ type: 'error', message: 'Please fix the errors above' });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success scenario
      setSubmitStatus({ 
        type: 'success', 
        message: 'Message sent successfully! We\'ll get back to you soon.' 
      });
      setFormData({ firstName: '', lastName: '', email: '', message: '' });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: '', message: '' });
      }, 5000);
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'Something went wrong. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-page">
      <Container className="py-5">
        <Row className="align-items-center g-5">
          <Col lg={5} className="mb-5 mb-lg-0">
            <div className="contact-info-panel animate-slide-left">
              <div className="info-badge">Get in touch</div>
              <h2 className="fw-bold mb-4 display-6">Let's Connect</h2>
              <p className="text-muted mb-4">We'd love to hear from you. Reach out anytime.</p>
              
              <div className="info-items-container">
                <div className="info-item">
                  <div className="icon-circle">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div className="info-content">
                    <h6>Our Location</h6>
                    <p className="text-muted mb-0 text-lowercase">Jalpa, Dholimara, Palpa, Nepal</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="icon-circle">
                    <i className="bi bi-envelope-fill"></i>
                  </div>
                  <div className="info-content">
                    <h6>Email Us</h6>
                    <p className="text-muted mb-0 text-lowercase">hello@ngau.com.np</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="icon-circle">
                    <i className="bi bi-headset"></i>
                  </div>
                  <div className="info-content">
                    <h6>24/7 Support</h6>
                    <p className="text-muted mb-0 text-lowercase">+977 (9762533455) NGAU-HELP</p>
                  </div>
                </div>
              </div>

              <div className="social-links mt-4">
                <a href="#" className="social-icon"><i className="bi bi-facebook"></i></a>
                <a href="#" className="social-icon"><i className="bi bi-twitter-x"></i></a>
                <a href="#" className="social-icon"><i className="bi bi-instagram"></i></a>
                <a href="#" className="social-icon"><i className="bi bi-linkedin"></i></a>
              </div>
            </div>
          </Col>
          
          <Col lg={7}>
            <div className="glass-form-card animate-slide-right">
              <div className="card-header">
                <h3 className="mb-1">Send us a message</h3>
                <p className="text-muted">We'll respond within 24 hours</p>
              </div>
              
              {submitStatus.message && (
                <Alert 
                  variant={submitStatus.type === 'success' ? 'success' : 'danger'} 
                  className="animate-fade-in"
                  dismissible
                  onClose={() => setSubmitStatus({ type: '', message: '' })}
                >
                  {submitStatus.message}
                </Alert>
              )}
              
              <Form onSubmit={handleSubmit} noValidate>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4 floating-input-group">
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder=" "
                        className={errors.firstName ? 'is-invalid' : ''}
                        disabled={isSubmitting}
                      />
                      <Form.Label>First Name</Form.Label>
                      {errors.firstName && (
                        <div className="invalid-feedback">{errors.firstName}</div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4 floating-input-group">
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder=" "
                        className={errors.lastName ? 'is-invalid' : ''}
                        disabled={isSubmitting}
                      />
                      <Form.Label>Last Name</Form.Label>
                      {errors.lastName && (
                        <div className="invalid-feedback">{errors.lastName}</div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4 floating-input-group">
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=" "
                    className={errors.email ? 'is-invalid' : ''}
                    disabled={isSubmitting}
                  />
                  <Form.Label>Email Address</Form.Label>
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </Form.Group>
                
                <Form.Group className="mb-4 floating-input-group">
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder=" "
                    className={errors.message ? 'is-invalid' : ''}
                    disabled={isSubmitting}
                  />
                  <Form.Label>How can we help?</Form.Label>
                  {errors.message && (
                    <div className="invalid-feedback">{errors.message}</div>
                  )}
                </Form.Group>
                
                <Button 
                  type="submit" 
                  className="w-100 submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Sending...</span>
                    </>
                  ) : (
                    'Send Message'
                  )}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ContactUs;