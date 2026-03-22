import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../utils/userApi';
import { orderApi } from '../utils/orderApi';
import '../styles/dashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth(); // ✅ only user and logout
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorProfile, setErrorProfile] = useState('');
  const [errorOrders, setErrorOrders] = useState('');

  // Framer Motion animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Fetch user profile
  const fetchProfile = async () => {
    setLoadingProfile(true);
    setErrorProfile('');
    try {
      const data = await userApi.getMe();
      setProfile(data); // store locally
    } catch (err) {
      console.error('Failed to load profile:', err);
      setErrorProfile('Unable to load user profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    setErrorOrders('');
    try {
      const data = await orderApi.getOrderHistory();
      setOrders(data); // local orders state
    } catch (err) {
      console.error('Failed to load orders:', err);
      setErrorOrders('Unable to load orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  return (
    <div className="dashboard-wrapper">
      {/* --- HERO SECTION --- */}
      <section className="dashboard-hero">
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hero-glass-panel"
          >
            {loadingProfile ? (
              <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : errorProfile ? (
              <Alert variant="danger">{errorProfile}</Alert>
            ) : (
              <Row className="align-items-center">
                <Col lg={8} className="text-center text-lg-start">
                  <Badge bg="none" className="badge-glow mb-3">Premium Member</Badge>
                  <h1 className="hero-title">
                    Welcome back, <span className="gradient-text">{profile?.username || 'Explorer'}</span>
                  </h1>
                  <p className="hero-subtitle">
                    Your account is in good standing. You have <span className="text-count">{orders.length}</span> recent orders.
                  </p>
                </Col>
                <Col lg={4} className="d-none d-lg-flex justify-content-end">
                  <div className="avatar-portal">
                    <div className="avatar-ring"></div>
                    <div className="avatar-main">
                      {profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                </Col>
              </Row>
            )}
          </motion.div>
        </Container>
      </section>

      {/* --- MAIN CONTENT --- */}
      <Container className="content-shift">
        <motion.div variants={containerVars} initial="hidden" animate="show">

          {/* Stats Grid */}
          <Row className="g-4 mb-4">
            <Col xs={6} lg={3}>
              <motion.div variants={itemVars} className="stat-glass-card">
                <div className="stat-icon bg-soft-success">
                  <i className="bi bi-wallet2"></i>
                </div>
                <div className="mt-3">
                  <h4 className="stat-value">Rs.{profile?.spending || 0}</h4>
                  <p className="stat-label">Spending</p>
                  <span className="stat-trend trend-success">+12%</span>
                </div>
              </motion.div>
            </Col>
            <Col xs={6} lg={3}>
              <motion.div variants={itemVars} className="stat-glass-card">
                <div className="stat-icon bg-soft-primary">
                  <i className="bi bi-truck"></i>
                </div>
                <div className="mt-3">
                  <h4 className="stat-value">{orders.length}</h4>
                  <p className="stat-label">Active Orders</p>
                  <span className="stat-trend trend-primary">In Transit</span>
                </div>
              </motion.div>
            </Col>
            <Col xs={6} lg={3}>
              <motion.div variants={itemVars} className="stat-glass-card">
                <div className="stat-icon bg-soft-danger">
                  <i className="bi bi-heart"></i>
                </div>
                <div className="mt-3">
                  <h4 className="stat-value">{profile?.wishlistCount || 0} Items</h4>
                  <p className="stat-label">Wishlist</p>
                  <span className="stat-trend trend-danger">2 Price Drops</span>
                </div>
              </motion.div>
            </Col>
            <Col xs={6} lg={3}>
              <motion.div variants={itemVars} className="stat-glass-card">
                <div className="stat-icon bg-soft-warning">
                  <i className="bi bi-trophy"></i>
                </div>
                <div className="mt-3">
                  <h4 className="stat-value">{profile?.rewards || 0} pts</h4>
                  <p className="stat-label">Rewards</p>
                  <span className="stat-trend trend-warning">Silver Tier</span>
                </div>
              </motion.div>
            </Col>
          </Row>

          {/* Order History */}
          <Row className="g-4">
            <Col lg={8}>
              <motion.div variants={itemVars} className="bento-card main-action-card h-100">
                <div className="card-header-custom">
                  <h5 className="mb-0 fw-bold">Recent Activity</h5>
                  <Button variant="link" className="text-decoration-none p-0">View All</Button>
                </div>

                {loadingOrders ? (
                  <div className="d-flex justify-content-center py-5">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : errorOrders ? (
                  <Alert variant="danger">{errorOrders}</Alert>
                ) : orders.length === 0 ? (
                  <p className="text-center text-muted py-5">No recent orders.</p>
                ) : (
                  <ListGroup variant="flush" className="activity-list">
                    {orders.map((order) => (
                      <ListGroup.Item key={order.id} className="d-flex align-items-center justify-content-between px-0">
                        <div className="d-flex align-items-center">
                          <div className="order-dot"></div>
                          <div>
                            <p className="mb-0 fw-semibold text-white">Order #{order.id}</p>
                            <div className="text-muted small">
                              {/* Mapping through names of items in the order */}
                              {order.items.map((item, idx) => (
                                <span key={item.id}>
                                  {item.product_name} (x{item.quantity})
                                  {idx < order.items.length - 1 ? ', ' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-end">
                          <p className="mb-0 fw-bold">
                            Rs.{order.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}
                          </p>
                          <Badge pill bg={order.status === 'delivered' ? 'success' : 'primary'} className="status-badge text-capitalize">
                            {order.status}
                          </Badge>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </motion.div>
            </Col>

            {/* Quick Actions / Support */}
            <Col lg={4}>
              <motion.div variants={itemVars} className="bento-card settings-card mb-4">
                <h5 className="fw-bold mb-3">Quick Actions</h5>
                <div className="d-grid gap-2">
                  <Button as={Link} to="/settings" className="btn-action">
                    <i className="bi bi-person-gear me-2"></i> Account Settings
                  </Button>
                  <Button as={Link} to="/support" className="btn-action">
                    <i className="bi bi-chat-dots me-2"></i> Support Center
                  </Button>
                </div>
              </motion.div>

              <motion.div variants={itemVars} className="bento-card upgrade-card">
                <div className="upgrade-content">
                  <h6>Unlock Pro Features</h6>
                  <p className="small text-white-50">Get free shipping and 5% cashback on all orders.</p>
                  <Button variant="light" size="sm" className="w-100 fw-bold">Upgrade Now</Button>
                </div>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Container>
    </div>
  );
};

export default UserDashboard;
