import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Table, Spinner, Badge, Modal, Form } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { adminApi } from '../../utils/adminApi'
import flashDealsApi from '../../utils/flashDealsApi'
import '../../styles/dashboard.css'
import AOS from 'aos'

// --- CHART.JS IMPORTS ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  // --- FLASH DEAL STATES ---
  const [allProducts, setAllProducts] = useState([])
  const [activeDeals, setActiveDeals] = useState([])
  const [showFlashModal, setShowFlashModal] = useState(false)
  const [selectedPid, setSelectedPid] = useState('')
  const [dealForm, setDealForm] = useState({ discount_price: '', duration: '24' })

  // --- CHART STATES ---
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] })
  const [orderStatusData, setOrderStatusData] = useState({ labels: [], datasets: [] })

  useEffect(() => {
    AOS.init()
    loadDashboardData()
    loadActiveDeals()
  }, [])

  const loadActiveDeals = async () => {
    try {
      const deals = await flashDealsApi.getDeals();
      setActiveDeals(Array.isArray(deals) ? deals : []);
    } catch (err) {
      console.error("Failed to load active deals", err);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [users, products, orders] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getProducts({limit: 100}),
        adminApi.getAllOrders()
      ])

      const actualProducts = Array.isArray(products) ? products : (products.data || []);

      setAllProducts(actualProducts) 

      const usersMap = {}
      users.forEach(u => { usersMap[u.id] = { username: u.username, email: u.email } })

      const enrichedOrders = orders.map(order => ({
        ...order,
        user: usersMap[order.user_id] || { username: 'Unknown', email: '' },
        total_price: order.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
      }))

      const totalRevenue = enrichedOrders
        .filter(o => ['paid', 'shipped', 'delivered'].includes(o.status))
        .reduce((sum, order) => sum + order.total_price, 0)

      // --- PROCESS CHART DATA ---
      // 1. Revenue Line Chart (Mocking last 7 days trend)
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      }).reverse();

      setRevenueData({
        labels: last7Days,
        datasets: [{
          label: 'Revenue (Rs.)',
          data: [totalRevenue * 0.1, totalRevenue * 0.15, totalRevenue * 0.12, totalRevenue * 0.2, totalRevenue * 0.18, totalRevenue * 0.25, totalRevenue],
          fill: true,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          tension: 0.4
        }]
      });

      // 2. Order Status Doughnut
      const statusCounts = { pending: 0, paid: 0, shipped: 0, delivered: 0, cancelled: 0 };
      orders.forEach(o => statusCounts[o.status] = (statusCounts[o.status] || 0) + 1);

      setOrderStatusData({
        labels: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
        datasets: [{
          data: [statusCounts.pending, statusCounts.paid, statusCounts.shipped, statusCounts.delivered, statusCounts.cancelled],
          backgroundColor: ['#ffc107', '#0dcaf0', '#0d6efd', '#198754', '#dc3545'],
          borderWidth: 0,
        }]
      });

      setStats({
        users: users.length,
        products: actualProducts.length,
        orders: orders.length,
        revenue: totalRevenue
      })

      setRecentOrders(enrichedOrders.slice(-5).reverse())
    } catch (err) {
      console.error("Failed to load dashboard data", err)
    } finally {
      setLoading(false)
    }
  }

  // --- FLASH DEAL HANDLERS ---
  const handleFlashDealSubmit = async (e) => {
    e.preventDefault();
    try {
      const expiryDate = new Date();
      if (dealForm.duration === '24') {
        expiryDate.setHours(expiryDate.getHours() + 24);
      } else {
        expiryDate.setDate(expiryDate.getDate() + 5);
      }

      await flashDealsApi.updateFlashDeal(selectedPid, {
        is_flash_deal: true,
        discount_price: parseFloat(dealForm.discount_price),
        deal_expiry: expiryDate.toISOString()
      });

      alert("⚡ Flash Deal Activated Successfully!");
      setShowFlashModal(false);
      loadDashboardData();
      loadActiveDeals(); 
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update flash deal");
    }
  }

  const handleCancelDeal = async (productId) => {
    if (!window.confirm("Are you sure you want to stop this flash deal? Product will return to normal price.")) return;
    try {
      await flashDealsApi.cancelFlashDeal(productId);
      alert("Deal Cancelled successfully.");
      loadActiveDeals(); 
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to cancel deal");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="danger" />
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = { pending: 'warning', paid: 'info', shipped: 'primary', delivered: 'success', cancelled: 'danger' }
    return colors[status] || 'secondary'
  }

  return (
    <div className="admin-main-content">
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-down">
          <div>
            <h1 className="fw-bold">
              <i className="bi bi-shield-lock-fill me-3 text-danger"></i>
              Command Center
            </h1>
            <p className="text-muted">Real-time overview of NGAU Bazaar</p>
          </div>
          <span className="badge bg-danger p-2 px-3 rounded-pill shadow-sm">Administrator Access</span>
        </div>

        {/* Stats Row */}
        <Row className="g-4 mb-4" data-aos="fade-up">
          <Col md={3}>
            <Card className="stat-widget shadow-sm h-100 border-0">
              <Card.Body>
                <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h3 className="fw-bold mb-1">{stats.users}</h3>
                <p className="text-muted small mb-0">Registered Customers</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-widget shadow-sm h-100 border-0">
              <Card.Body>
                <div className="stat-icon bg-success bg-opacity-10 text-success">
                  <i className="bi bi-box-seam-fill"></i>
                </div>
                <h3 className="fw-bold mb-1">{stats.products}</h3>
                <p className="text-muted small mb-0">Active Products</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-widget shadow-sm h-100 border-0">
              <Card.Body>
                <div className="stat-icon bg-info bg-opacity-10 text-info">
                  <i className="bi bi-bag-check-fill"></i>
                </div>
                <h3 className="fw-bold mb-1">{stats.orders}</h3>
                <p className="text-muted small mb-0">Total Orders</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-widget shadow-sm h-100 border-0">
              <Card.Body>
                <div className="stat-icon bg-warning bg-opacity-10 text-warning">
                  <i className="bi bi-currency-rupee"></i>
                </div>
                <h3 className="fw-bold mb-1">Rs.{stats.revenue.toLocaleString()}</h3>
                <p className="text-muted small mb-0">Gross Revenue</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* --- VISUAL ANALYTICS (NEW) --- */}
        <Row className="g-4 mb-5" data-aos="fade-up">
          <Col lg={8}>
            <Card className="border-0 shadow-sm p-4 h-100">
              <h5 className="fw-bold mb-4">Revenue Overview</h5>
              <div style={{ height: '300px' }}>
                <Line 
                  data={revenueData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }} 
                />
              </div>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="border-0 shadow-sm p-4 h-100">
              <h5 className="fw-bold mb-4">Order Status</h5>
              <div style={{ height: '300px' }} className="d-flex justify-content-center">
                <Doughnut 
                  data={orderStatusData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                  }} 
                />
              </div>
            </Card>
          </Col>
        </Row>

        <h5 className="mb-3 fw-bold">Quick Management</h5>
        <Row className="g-4 mb-5">
          {[
            { title: 'Users', icon: 'bi-person-plus', color: 'primary', path: '/admin/users' },
            { title: 'Products', icon: 'bi-box-seam', color: 'success', path: '/admin/products' },
            { title: 'Orders', icon: 'bi-receipt', color: 'info', path: '/admin/orders' },
            { title: 'Categories', icon: 'bi-tags-fill', color: 'dark', path:'/admin/categories' },
            { title: 'Flash Deals', icon: 'bi-lightning-charge-fill', color: 'danger', path: '/admin/flash-deals' }, 
          ].map((item, idx) => (
            <Col key={idx} md={6} lg={3}>
              <Card className="h-100 shadow-sm border-0 admin-action-card text-center p-3">
                <Card.Body>
                  <i className={`bi ${item.icon} display-6 text-${item.color} mb-3`}></i>
                  <h6>{item.title}</h6>
                  <Button as={Link} to={item.path} variant={`outline-${item.color}`} size="sm" className="mt-2 rounded-pill">
                    Manage
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="admin-card border-0 shadow-sm overflow-hidden">
          <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">
              <i className="bi bi-clock-history me-2 text-primary"></i>
              Recent Orders
            </h5>
            <Button as={Link} to="/admin/orders" variant="outline-primary" size="sm" className="rounded-pill">View All</Button>
          </Card.Header>
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4">Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th className="text-end px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id}>
                  <td className="px-4 fw-bold">#{order.id}</td>
                  <td>{order.user.username}</td>
                  <td><Badge bg={getStatusColor(order.status)}>{order.status}</Badge></td>
                  <td className="text-end px-4">
                    <Button as={Link} to={`/admin/orders/${order.id}`} variant="link" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Container>
    </div>
  )
}

export default AdminDashboard