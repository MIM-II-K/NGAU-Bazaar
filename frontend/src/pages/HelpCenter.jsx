import React, { useState } from 'react';
import { Container, Accordion, Form, InputGroup, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Package, RefreshCcw, ShieldCheck, CreditCard, 
  LifeBuoy, MessageCircle, Mail, Phone, ExternalLink, ChevronRight 
} from 'lucide-react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { icon: <Package size={24} />, title: 'Shipping', count: '12 Articles', color: '#4f46e5' },
    { icon: <RefreshCcw size={24} />, title: 'Returns', count: '8 Articles', color: '#7c3aed' },
    { icon: <ShieldCheck size={24} />, title: 'Security', count: '5 Articles', color: '#2563eb' },
    { icon: <CreditCard size={24} />, title: 'Payments', count: '10 Articles', color: '#db2777' },
  ];

  const trendingArticles = [
    "How to change my delivery address?",
    "Payment failed but money was deducted",
    "How to apply a promo code",
    "International customs and duties guide"
  ];

  return (
    <div className="help-center-v2 bg-light min-vh-100">
      {/* Modern Hero Section */}
      <div className="help-hero-gradient pt-5 pb-5 mb-5">
        <Container>
          <Row className="justify-content-center text-center pt-4">
            <Col lg={8}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Badge bg="light" text="dark" className="px-3 py-2 rounded-pill mb-3 shadow-sm">
                  Support Portal 2.0
                </Badge>
                <h1 className="display-5 fw-bold text-white mb-4">Support & Resources</h1>
                <InputGroup className="search-box-glow shadow-lg rounded-4 overflow-hidden mb-3">
                  <InputGroup.Text className="bg-white border-0 ps-4">
                    <Search className="text-primary" size={22} />
                  </InputGroup.Text>
                  <Form.Control 
                    size="lg"
                    placeholder="Search by keyword, order ID, or topic..." 
                    className="border-0 py-4 shadow-none fs-6"
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="white" className="pe-4 fw-bold text-primary">Search</Button>
                </InputGroup>
                <div className="d-flex flex-wrap justify-content-center gap-2 text-white-50 small">
                  <span>Popular:</span>
                  {['Refunds', 'Tracking', 'Account'].map(tag => (
                    <a key={tag} href="#" className="text-white text-decoration-none border-bottom border-secondary">{tag}</a>
                  ))}
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mt-n5">
        <Row>
          {/* Left Sidebar: Categories */}
          <Col lg={4} className="mb-4">
            <Card className="border-0 shadow-sm rounded-4 sticky-top" style={{ top: '2rem' }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Browse by Topic</h5>
                {categories.map((cat, idx) => (
                  <div key={idx} className="category-item d-flex align-items-center p-3 rounded-3 mb-2 transition-all">
                    <div className="icon-box me-3 p-2 rounded-3" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                      {cat.icon}
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark">{cat.title}</div>
                      <div className="text-muted small">{cat.count}</div>
                    </div>
                    <ChevronRight size={18} className="text-muted" />
                  </div>
                ))}
                <hr className="my-4 opacity-50" />
                <div className="bg-primary bg-opacity-10 p-4 rounded-4 text-center">
                  <h6>Pro Tip</h6>
                  <p className="small text-muted mb-0">You can manage all your returns directly from the dashboard.</p>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Content: FAQ & Trending */}
          <Col lg={8}>
            <div className="mb-5">
              <h4 className="fw-bold mb-4 d-flex align-items-center">
                <LifeBuoy className="me-2 text-primary" /> Trending Articles
              </h4>
              <Row className="g-3">
                {trendingArticles.map((article, i) => (
                  <Col md={6} key={i}>
                    <Card className="h-100 border-0 shadow-sm article-card">
                      <Card.Body className="p-3 d-flex align-items-center">
                        <ExternalLink size={16} className="text-muted me-3" />
                        <span className="fw-medium">{article}</span>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            <h4 className="fw-bold mb-4">Frequently Asked Questions</h4>
            <Accordion className="custom-accordion-v2 shadow-sm rounded-4 overflow-hidden">
              <Accordion.Item eventKey="0" className="border-0 border-bottom">
                <Accordion.Header>How do I track my order in real-time?</Accordion.Header>
                <Accordion.Body className="text-secondary bg-white">
                  Once your order ships, you will receive an email with a tracking link. Alternatively, 
                  head to your <strong>Dashboard &gt; Orders</strong> and click the "Track Package" button.
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1" className="border-0">
                <Accordion.Header>What is the return policy?</Accordion.Header>
                <Accordion.Body className="text-secondary bg-white">
                  We offer a 30-day money-back guarantee. For international returns, please ensure 
                  items are in original packaging. 
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

            {/* Support CTA */}
            <div className="mt-5 p-5 bg-dark rounded-4 text-white text-center position-relative overflow-hidden">
               <div className="position-relative z-index-1">
                <h3 className="fw-bold">Still stuck? We're here.</h3>
                <p className="text-white-50 mb-4">Our average response time is under 20 minutes.</p>
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Button variant="primary" className="px-4 py-2 d-flex align-items-center rounded-pill">
                    <MessageCircle size={18} className="me-2" /> Live Chat
                  </Button>
                  <Button variant="outline-light" className="px-4 py-2 d-flex align-items-center rounded-pill">
                    <Mail size={18} className="me-2" /> Email Support
                  </Button>
                </div>
               </div>
               <div className="support-blob"></div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HelpCenter;