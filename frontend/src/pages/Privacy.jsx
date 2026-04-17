import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  Mail, 
  CreditCard,
  Globe,
  FileText,
  CheckCircle,
  AlertCircle,
  Home,
  ArrowRight,
  Fingerprint,
  Cookie,
  Trash2,
  Bell,
  UserCheck,
  Server,
  Clock,
  Truck,
  Heart,
  Smartphone,
  RefreshCw,
  MessageCircle,
  Phone,
  MapPin,
  Send,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import '../styles/privacy-policy.css';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('information');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
      
      // Update active section based on scroll position
      const sections = document.querySelectorAll('.privacy-section');
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY + 200 >= sectionTop && window.scrollY + 200 < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });
      if (current) setActiveSection(current);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const sections = [
    {
      id: 'information',
      icon: <Database size={24} />,
      iconGradient: 'linear-gradient(135deg, #10b981, #059669)',
      title: 'Information We Collect',
      badge: 'Data Collection',
      content: (
        <>
          <p className="section-lead">We collect information to provide better services and a personalized experience for you.</p>
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon"><UserCheck size={20} /></div>
              <h4>Personal Information</h4>
              <p>Name, email address, phone number, delivery address, and date of birth for account verification.</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><CreditCard size={20} /></div>
              <h4>Payment Information</h4>
              <p>Transaction details, payment method, and billing address. We never store full payment credentials.</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><Smartphone size={20} /></div>
              <h4>Device Information</h4>
              <p>IP address, browser type, device identifiers, and location data for security purposes.</p>
            </div>
            <div className="info-card">
              <div className="info-icon"><Heart size={20} /></div>
              <h4>Preference Data</h4>
              <p>Browsing behavior, wishlist items, search history, and product preferences.</p>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'usage',
      icon: <Eye size={24} />,
      iconGradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      title: 'How We Use Your Information',
      badge: 'Data Usage',
      content: (
        <>
          <p className="section-lead">Your information helps us create a seamless and secure shopping experience.</p>
          <div className="usage-grid">
            <div className="usage-item">
              <div className="usage-number">01</div>
              <div>
                <h4>Order Processing</h4>
                <p>Process and deliver your orders with real-time tracking and updates.</p>
              </div>
            </div>
            <div className="usage-item">
              <div className="usage-number">02</div>
              <div>
                <h4>Personalization</h4>
                <p>Tailor product recommendations and offers based on your preferences.</p>
              </div>
            </div>
            <div className="usage-item">
              <div className="usage-number">03</div>
              <div>
                <h4>Customer Support</h4>
                <p>Provide timely assistance and resolve your queries effectively.</p>
              </div>
            </div>
            <div className="usage-item">
              <div className="usage-number">04</div>
              <div>
                <h4>Security</h4>
                <p>Detect and prevent fraudulent activities to protect your account.</p>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'sharing',
      icon: <Globe size={24} />,
      iconGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      title: 'Information Sharing',
      badge: 'Third Parties',
      content: (
        <>
          <p className="section-lead">We value your privacy and only share information when necessary.</p>
          <div className="sharing-cards">
            <div className="sharing-card">
              <div className="sharing-icon"><Truck size={24} /></div>
              <h4>Delivery Partners</h4>
              <p>Shipping address and contact details for order delivery</p>
              <span className="sharing-badge">Essential</span>
            </div>
            <div className="sharing-card">
              <div className="sharing-icon"><CreditCard size={24} /></div>
              <h4>Payment Processors</h4>
              <p>Transaction details for secure payment processing</p>
              <span className="sharing-badge">Secure</span>
            </div>
            <div className="sharing-card">
              <div className="sharing-icon"><Server size={24} /></div>
              <h4>Service Providers</h4>
              <p>Analytics and customer support tools</p>
              <span className="sharing-badge">Limited</span>
            </div>
          </div>
          <div className="info-alert">
            <AlertCircle size={20} />
            <p>We never sell your personal information to third parties for marketing purposes.</p>
          </div>
        </>
      )
    },
    {
      id: 'security',
      icon: <Lock size={24} />,
      iconGradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      title: 'Data Security',
      badge: 'Protection',
      content: (
        <>
          <p className="section-lead">Bank-grade security measures to protect your information.</p>
          <div className="security-grid">
            <div className="security-item">
              <div className="security-icon"><Lock size={28} /></div>
              <h4>256-bit SSL Encryption</h4>
              <p>All data transmitted is encrypted using industry-standard SSL technology</p>
              <div className="security-progress">
                <div className="security-bar" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div className="security-item">
              <div className="security-icon"><Fingerprint size={28} /></div>
              <h4>Two-Factor Authentication</h4>
              <p>Optional 2FA for enhanced account protection</p>
              <div className="security-progress">
                <div className="security-bar" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div className="security-item">
              <div className="security-icon"><Shield size={28} /></div>
              <h4>Regular Audits</h4>
              <p>Monthly security assessments and penetration testing</p>
              <div className="security-progress">
                <div className="security-bar" style={{ width: '98%' }}></div>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'cookies',
      icon: <Cookie size={24} />,
      iconGradient: 'linear-gradient(135deg, #ec4899, #be185d)',
      title: 'Cookies & Tracking',
      badge: 'Preferences',
      content: (
        <>
          <p className="section-lead">We use cookies to enhance your browsing experience.</p>
          <div className="cookies-table">
            <div className="cookie-header">
              <span>Type</span>
              <span>Purpose</span>
              <span>Duration</span>
            </div>
            <div className="cookie-row">
              <span>Essential</span>
              <span>Required for basic site functionality</span>
              <span>Session</span>
            </div>
            <div className="cookie-row">
              <span>Preference</span>
              <span>Remember your settings and preferences</span>
              <span>1 year</span>
            </div>
            <div className="cookie-row">
              <span>Analytics</span>
              <span>Understand how visitors use our site</span>
              <span>2 years</span>
            </div>
            <div className="cookie-row">
              <span>Marketing</span>
              <span>Show relevant product recommendations</span>
              <span>6 months</span>
            </div>
          </div>
          <div className="cookie-control">
            <ShieldCheck size={20} />
            <p>You can manage cookie preferences in your browser settings at any time.</p>
          </div>
        </>
      )
    },
    {
      id: 'rights',
      icon: <CheckCircle size={24} />,
      iconGradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      title: 'Your Rights',
      badge: 'GDPR Compliant',
      content: (
        <>
          <p className="section-lead">You have full control over your personal data.</p>
          <div className="rights-grid">
            <div className="right-card">
              <div className="right-icon"><Eye size={24} /></div>
              <h4>Right to Access</h4>
              <p>Request a copy of all data we hold about you</p>
            </div>
            <div className="right-card">
              <div className="right-icon"><RefreshCw size={24} /></div>
              <h4>Right to Rectification</h4>
              <p>Correct inaccurate or incomplete information</p>
            </div>
            <div className="right-card">
              <div className="right-icon"><Trash2 size={24} /></div>
              <h4>Right to Deletion</h4>
              <p>Request permanent deletion of your account</p>
            </div>
            <div className="right-card">
              <div className="right-icon"><Bell size={24} /></div>
              <h4>Right to Opt-out</h4>
              <p>Unsubscribe from marketing communications</p>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'retention',
      icon: <Clock size={24} />,
      iconGradient: 'linear-gradient(135deg, #84cc16, #4d7c0f)',
      title: 'Data Retention',
      badge: 'Schedule',
      content: (
        <>
          <p className="section-lead">We retain your data only as long as necessary.</p>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Active Accounts</h4>
                <p>Data retained while your account is active</p>
                <span className="timeline-duration">Indefinite (until deletion)</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Inactive Accounts</h4>
                <p>Accounts with no activity for 2 years</p>
                <span className="timeline-duration">Anonymized after 2 years</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Transaction Records</h4>
                <p>For tax and legal compliance</p>
                <span className="timeline-duration">7 years</span>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      id: 'contact',
      icon: <MessageCircle size={24} />,
      iconGradient: 'linear-gradient(135deg, #f97316, #ea580c)',
      title: 'Contact Us',
      badge: 'Get in Touch',
      content: (
        <>
          <p className="section-lead">Have questions? Our team is here to help.</p>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon"><Mail size={28} /></div>
              <h4>Email Us</h4>
              <a href="mailto:privacy@ngaubazaar.com">privacy@ngaubazaar.com</a>
              <p>Response within 24 hours</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon"><Phone size={28} /></div>
              <h4>Call Us</h4>
              <a href="tel:+9771234567890">+977 123-4567890</a>
              <p>Mon-Fri, 9AM - 6PM</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon"><MapPin size={28} /></div>
              <h4>Visit Us</h4>
              <p>Dholimara, Palpa<br />Lumbini Province, Nepal</p>
            </div>
            <div className="contact-card">
              <div className="contact-icon"><Shield size={28} /></div>
              <h4>Data Protection Officer</h4>
              <a href="mailto:dpo@ngaubazaar.com">dpo@ngaubazaar.com</a>
              <p>For privacy-specific concerns</p>
            </div>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="privacy-policy-page">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Hero Section with Parallax */}
      <motion.section 
        className="privacy-hero"
        style={{ opacity, scale }}
      >
        <Container>
          <motion.div
            className="privacy-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              className="hero-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
            >
              <Sparkles size={16} />
              <span>Updated: April 2026</span>
            </motion.div>
            
            <motion.div 
              className="hero-icon-wrapper"
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", delay: 0.6 }}
            >
              <div className="hero-icon-glow"></div>
              <Shield size={56} />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Your Privacy Matters
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              At NGAU Bazaar, we're committed to protecting your personal information with 
              the highest security standards.
            </motion.p>
            
            <motion.div 
              className="hero-stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <div className="hero-stat">
                <span className="stat-number">256-bit</span>
                <span className="stat-label">SSL Encryption</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">GDPR Compliant</span>
              </div>
              <div className="hero-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support</span>
              </div>
            </motion.div>
          </motion.div>
        </Container>
        
        <motion.div 
          className="hero-wave"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 64L60 69.3C120 75 240 85 360 80C480 75 600 53 720 48C840 43 960 53 1080 58.7C1200 64 1320 64 1380 64L1440 64V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V64Z" fill="white"/>
          </svg>
        </motion.div>
      </motion.section>

      {/* Main Content */}
      <section className="privacy-content-section">
        <Container>
          <Row>
            {/* Sidebar Navigation */}
            <Col lg={3} md={12}>
              <motion.div
                className="privacy-sidebar"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="sidebar-header">
                  <Zap size={20} />
                  <h3>Quick Navigation</h3>
                </div>
                <nav className="sidebar-nav">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={`sidebar-link ${activeSection === section.id ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(section.id)?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }}
                    >
                      <span className="sidebar-icon">{section.icon}</span>
                      <span className="sidebar-text">{section.title}</span>
                      {activeSection === section.id && (
                        <motion.div 
                          className="sidebar-active-indicator"
                          layoutId="activeIndicator"
                        />
                      )}
                    </a>
                  ))}
                </nav>
                
                <motion.div 
                  className="sidebar-cta"
                  whileHover={{ scale: 1.02 }}
                >
                  <ShieldCheck size={24} />
                  <p>Your data is protected with enterprise-grade security</p>
                  <div className="cta-progress">
                    <div className="cta-progress-bar"></div>
                  </div>
                </motion.div>
              </motion.div>
            </Col>

            {/* Main Content */}
            <Col lg={9} md={12}>
              <motion.div
                className="privacy-main"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {/* Introduction */}
                <motion.div className="privacy-intro" variants={fadeInUp}>
                  <div className="intro-badge">Introduction</div>
                  <h2>Welcome to NGAU Bazaar</h2>
                  <p>
                    We believe in transparency and are committed to protecting your privacy. 
                    This Privacy Policy explains how we collect, use, and safeguard your information 
                    when you use our services.
                  </p>
                  <div className="intro-highlight">
                    <ShieldCheck size={24} />
                    <div>
                      <strong>Our Commitment</strong>
                      <p>We never sell your personal data to third parties.</p>
                    </div>
                  </div>
                </motion.div>

                {/* Sections */}
                {sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    id={section.id}
                    className="privacy-section"
                    variants={fadeInUp}
                  >
                    <div className="section-header">
                      <div className="section-icon" style={{ background: section.iconGradient }}>
                        {section.icon}
                      </div>
                      <div className="section-title-wrapper">
                        <span className="section-badge">{section.badge}</span>
                        <h2>{section.title}</h2>
                      </div>
                    </div>
                    <div className="section-content">
                      {section.content}
                    </div>
                  </motion.div>
                ))}

                {/* Footer Note */}
                <motion.div className="privacy-footer-note" variants={fadeInUp}>
                  <div className="note-card">
                    <div className="note-icon">
                      <MessageCircle size={24} />
                    </div>
                    <div className="note-content">
                      <h4>Still have questions?</h4>
                      <p>We're here to help you understand our privacy practices.</p>
                      <Link to="/contact" className="note-button">
                        Contact Our Privacy Team
                        <Send size={16} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Trust Badges Section */}
      <section className="trust-badges-section">
        <Container>
          <motion.div
            className="trust-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="trust-eyebrow">OUR CERTIFICATIONS</span>
            <h2>Trust & Compliance</h2>
          </motion.div>
          
          <Row className="g-4">
            {[
              { icon: <Lock size={32} />, title: 'PCI DSS Compliant', desc: 'Secure payment processing', color: '#10b981' },
              { icon: <Shield size={32} />, title: 'GDPR Ready', desc: 'International privacy standards', color: '#8b5cf6' },
              { icon: <CheckCircle size={32} />, title: 'ISO 27001', desc: 'Information security management', color: '#f59e0b' },
              { icon: <Fingerprint size={32} />, title: 'SOC 2 Type II', desc: 'Regular security audits', color: '#ec4899' }
            ].map((badge, idx) => (
              <Col md={3} sm={6} key={idx}>
                <motion.div 
                  className="trust-badge-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="trust-badge-icon" style={{ color: badge.color }}>
                    {badge.icon}
                  </div>
                  <h4>{badge.title}</h4>
                  <p>{badge.desc}</p>
                  <div className="trust-check">
                    <CheckCircle size={16} />
                    <span>Verified</span>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default PrivacyPolicy;