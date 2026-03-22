import { useState, useEffect } from 'react';
import { Container, Table, Badge, Form, Button, Card, Spinner, Row, Col } from 'react-bootstrap';
import { adminApi } from '../../utils/adminApi';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../../styles/AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [statusFilter, setStatusFilter] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders(page, limit, statusFilter);
    AOS.init({ duration: 600 });
  }, [page, limit, statusFilter]);

  const fetchOrders = async (page = 1, limit = 50, status = '') => {
    try {
      setLoading(true);
      const res = await adminApi.getAllOrders(page, limit, status);
      console.log("Orders API response:", res);
      setOrders(res || []);
      // optional if you want to display total count
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      fetchOrders(page, limit, statusFilter); // refresh after update
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      paid: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return colors[status] || 'secondary';
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "N/A";
    const dt = new Date(datetime);
    return dt.toLocaleString("en-NP", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  return (
    <div className="admin-main-content">
      <Container>
        {/* Header & Controls */}
        <Row className="align-items-center mb-3" data-aos="fade-down">
          <Col>
            <h2 className="fw-bold">Order Fulfillment</h2>
          </Col>
          <Col className="text-end">
            <Form.Select
              size="sm"
              style={{ width: "fit-content" }}
              className="d-inline-block me-2"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">Order status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>

            <Button variant="outline-primary" onClick={() => fetchOrders(page, limit, statusFilter)} className="btn-modern me-2">
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </Button>

            <Button variant="outline-success" onClick={() => fetchOrders(1, 1000, statusFilter)}>
              View All Orders
            </Button>
          </Col>
        </Row>

        {/* Orders Table */}
        <Card className="admin-card border-0 shadow-sm" data-aos="fade-up">
          <Table hover responsive className="admin-table mb-0">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Items</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 fw-bold"
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                      >
                        #{order.id}
                      </Button>
                    </td>
                    <td>{order.user_id}</td>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 fw-semibold"
                        onClick={() => navigate(`/admin/users/${order.user_id}/orders`)}
                      >
                        {order.username || "N/A"}
                      </Button>
                    </td>
                    <td>{order.email || "N/A"}</td>
                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {order.items?.length || 0} Product(s)
                      </Badge>
                    </td>
                    <td>{formatDateTime(order.created_at)}</td>
                    <td>
                      <Badge bg={getStatusColor(order.status)} className="status-badge">
                        {order.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        className="w-auto d-inline-block rounded-3"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option disabled value="">Move to...</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </Form.Select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>

        {/* Pagination Controls */}
        {orders.length > 0 && totalOrders > limit && (
          <div className="d-flex justify-content-between mt-3">
            <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span>Page {page}</span>
            <Button disabled={orders.length < limit} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default AdminOrders;
