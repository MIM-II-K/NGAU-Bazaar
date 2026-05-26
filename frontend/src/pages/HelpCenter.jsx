import React, { useState, useMemo } from 'react';
import { Container, Accordion, Form, InputGroup, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Package, RefreshCcw, ShieldCheck, CreditCard, 
  LifeBuoy, MessageCircle, Mail, ExternalLink, ChevronRight, 
  Clock, Star, Headphones, Zap, Filter, X
} from 'lucide-react';
import "../styles/help-center.css";

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Sample articles data
  const articles = {
    all: [
      { id: 1, title: "How do I track my order in real-time?", category: "Shipping", content: "Once your order ships, you will receive an email with a tracking link. Alternatively, head to your Dashboard > Orders and click the 'Track Package' button." },
      { id: 2, title: "What is the return policy?", category: "Returns", content: "We offer a 30-day money-back guarantee. For international returns, please ensure items are in original packaging." },
      { id: 3, title: "Payment failed but money was deducted", category: "Payments", content: "If payment fails but amount is deducted, it will be auto-refunded within 5-7 business days. Contact support if not resolved." },
      { id: 4, title: "How to apply a promo code", category: "Payments", content: "At checkout, enter your promo code in the 'Gift card or promo code' field and click 'Apply'." },
      { id: 5, title: "International customs and duties guide", category: "Shipping", content: "Customs fees vary by country. We recommend checking local regulations before ordering." },
      { id: 6, title: "Is my data secure?", category: "Security", content: "Yes, we use 256-bit SSL encryption and never store full payment details." },
      { id: 7, title: "How to change my delivery address?", category: "Shipping", content: "You can change address within 1 hour of placing the order via your order details page." },
      { id: 8, title: "How do I contact support?", category: "General", content: "Use live chat (available 24/7) or email support@example.com. Response within 20 minutes." }
    ],
    Shipping: [],
    Returns: [],
    Security: [],
    Payments: []
  };

  // Populate category-specific arrays
  articles.all.forEach(article => {
    const cat = article.category;
    if (articles[cat]) articles[cat].push(article);
    else articles.General = articles.General || [];
  });

  const categories = [
    { id: 'all', icon: <Package size={20} />, title: 'All Topics', count: articles.all.length, color: '#4f46e5' },
    { id: 'Shipping', icon: <Package size={20} />, title: 'Shipping', count: articles.Shipping.length, color: '#3b82f6' },
    { id: 'Returns', icon: <RefreshCcw size={20} />, title: 'Returns', count: articles.Returns.length, color: '#10b981' },
    { id: 'Security', icon: <ShieldCheck size={20} />, title: 'Security', count: articles.Security.length, color: '#8b5cf6' },
    { id: 'Payments', icon: <CreditCard size={20} />, title: 'Payments', count: articles.Payments.length, color: '#ec4899' },
  ];

  const trendingArticles = articles.all.slice(0, 4);

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    let result = activeCategory === 'all' ? articles.all : articles[activeCategory] || [];
    if (searchQuery.trim()) {
      result = result.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [searchQuery, activeCategory]);

  const hasResults = filteredArticles.length > 0;

  return (
    <div className="help-center-v2">
      {/* Animated Background Elements */}
      <div className="bg-animation">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Hero Section with Particle Effect */}
      <div className="help-hero-gradient pt-5 pb-5">
        <Container>
          <Row className="justify-content-center text-center pt-4">
            <Col lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge bg="light" text="dark" className="px-4 py-2 rounded-pill mb-3 shadow-sm animate-badge">
                  <Zap size={14} className="me-1" /> AI-Powered Support 2.0
                </Badge>
                <h1 className="display-5 fw-bold text-white mb-4">How can we help you today?</h1>
                <p className="text-white-50 mb-4 fs-5">Instant answers, guides, and support — all in one place.</p>
                
                {/* Animated Search Bar */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <InputGroup className="search-box-glow shadow-lg rounded-4 overflow-hidden mb-3">
                    <InputGroup.Text className="bg-white border-0 ps-4">
                      <Search className="text-primary" size={22} />
                    </InputGroup.Text>
                    <Form.Control 
                      size="lg"
                      placeholder="Search by keyword, order ID, or topic..." 
                      className="border-0 py-4 shadow-none fs-6"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button 
                        variant="link" 
                        className="pe-3 text-muted"
                        onClick={() => setSearchQuery('')}
                      >
                        <X size={18} />
                      </Button>
                    )}
                    <Button variant="primary" className="px-4 fw-bold search-btn">Search</Button>
                  </InputGroup>
                </motion.div>

                <div className="d-flex flex-wrap justify-content-center gap-2 text-white-50 small">
                  <span>Popular:</span>
                  {['Refunds', 'Tracking', 'Account', 'Promo Code'].map(tag => (
                    <motion.a
                      key={tag}
                      href="#"
                      className="text-white text-decoration-none border-bottom border-secondary hover-glow"
                      whileHover={{ y: -2 }}
                      onClick={(e) => { e.preventDefault(); setSearchQuery(tag); }}
                    >
                      {tag}
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mt-n5 position-relative" style={{ zIndex: 2 }}>
        <Row>
          {/* Sticky Sidebar Categories */}
          <Col lg={4} className="mb-4">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky-sidebar"
            >
              <Card className="border-0 shadow-lg rounded-4 category-sidebar">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Browse Topics</h5>
                    <Filter size={18} className="text-muted" />
                  </div>
                  {categories.map((cat, idx) => (
                    <motion.div
                      key={cat.id}
                      whileHover={{ x: 8 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`category-item d-flex align-items-center p-3 rounded-3 mb-2 transition-all ${activeCategory === cat.id ? 'active-category' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="icon-box me-3 p-2 rounded-3" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                          {cat.icon}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-dark">{cat.title}</div>
                          <div className="text-muted small">{cat.count} articles</div>
                        </div>
                        {activeCategory === cat.id && <ChevronRight size={18} className="text-primary" />}
                      </div>
                    </motion.div>
                  ))}
                  <hr className="my-4 opacity-50" />
                  <div className="bg-gradient-primary p-4 rounded-4 text-center">
                    <Headphones size={32} className="text-white mb-2" />
                    <h6 className="text-white">Need personalized help?</h6>
                    <p className="small text-white-50 mb-3">Our team is online 24/7</p>
                    <Button variant="light" size="sm" className="rounded-pill px-3">Start Live Chat →</Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          {/* Main Content Area */}
          <Col lg={8}>
            {/* Trending Section with Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-5"
            >
              <div className="d-flex align-items-center mb-4">
                <LifeBuoy className="text-primary me-2" size={28} />
                <h4 className="fw-bold mb-0">Trending Articles</h4>
                <Badge bg="warning" text="dark" className="ms-3 rounded-pill">🔥 Hot</Badge>
              </div>
              <Row className="g-3">
                {trendingArticles.map((article, i) => (
                  <Col md={6} key={i}>
                    <motion.div
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Card className="h-100 border-0 shadow-sm article-card">
                        <Card.Body className="p-3 d-flex align-items-center">
                          <ExternalLink size={16} className="text-muted me-3 flex-shrink-0" />
                          <span className="fw-medium text-truncate">{article.title}</span>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>

            {/* FAQ Accordion with AnimatePresence */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h4 className="fw-bold mb-2">
                  {searchQuery ? `Search Results (${filteredArticles.length})` : 'Frequently Asked Questions'}
                </h4>
                {activeCategory !== 'all' && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setActiveCategory('all')}
                    className="text-decoration-none"
                  >
                    Clear filter <X size={14} />
                  </Button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!hasResults ? (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center py-5 bg-white rounded-4 shadow-sm"
                  >
                    <Search size={48} className="text-muted mb-3" />
                    <h5>No articles found</h5>
                    <p className="text-muted">Try different keywords or browse categories</p>
                    <Button variant="outline-primary" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>
                      Clear filters
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="faq-accordion-wrapper"
                  >
                    <Accordion className="custom-accordion-v2 shadow-sm rounded-4 overflow-hidden">
                      {filteredArticles.map((article, idx) => (
                        <Accordion.Item eventKey={idx.toString()} key={article.id} className="border-0 border-bottom">
                          <Accordion.Header>
                            <div className="d-flex align-items-center w-100">
                              <span className="me-2">{article.category}</span>
                              <span className="fw-semibold">{article.title}</span>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body className="text-secondary bg-white">
                            {article.content}
                            <div className="mt-2">
                              <Button variant="link" size="sm" className="ps-0 text-primary">
                                Read full article <ChevronRight size={14} />
                              </Button>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Enhanced Support CTA with Particles */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-5 support-cta"
            >
              <div className="support-cta-inner">
                <div className="particles">
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                </div>
                <div className="position-relative z-2 text-center">
                  <Clock size={40} className="text-white mb-3 opacity-75" />
                  <h3 className="fw-bold text-white">Still stuck? We're here.</h3>
                  <p className="text-white-50 mb-4 fs-5">Average response time under 20 minutes — 24/7 support</p>
                  <div className="d-flex flex-wrap justify-content-center gap-3">
                    <Button variant="light" className="px-4 py-2 d-flex align-items-center rounded-pill fw-bold">
                      <MessageCircle size={18} className="me-2 text-primary" /> Live Chat
                    </Button>
                    <Button variant="outline-light" className="px-4 py-2 d-flex align-items-center rounded-pill">
                      <Mail size={18} className="me-2" /> Email Support
                    </Button>
                  </div>
                  <p className="text-white-50 small mt-3 mb-0">Or call us at <strong className="text-white">+977 123-4567</strong></p>
                </div>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HelpCenter;