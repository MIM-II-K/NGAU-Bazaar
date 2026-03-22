import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, Badge, Button, Spinner, Alert, Row, Col, Image, Container, Form, ListGroup } from "react-bootstrap";
import { motion } from "framer-motion";
import { FiPackage, FiTruck, FiCheckCircle, FiPrinter, FiMail, FiMapPin, FiCreditCard } from "react-icons/fi";
import apiClient from "../../utils/api";
import "../../styles/order-detail.css";

const AdminOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => { if (orderId) fetchOrder(); }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get(`/orders/admin/${orderId}`);
      setOrder(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      // REMOVE "/admin" from the URL below
      await apiClient.put(`/orders/${orderId}/status?status=${newStatus}`);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || "Update failed"));
    } finally {
      setUpdating(false);
    }
  };

  const statusMap = {
    pending: { variant: "warning", icon: <FiPackage /> },
    paid: { variant: "primary", icon: <FiCreditCard /> },
    shipped: { variant: "info", icon: <FiTruck /> },
    delivered: { variant: "success", icon: <FiCheckCircle /> },
    cancelled: { variant: "danger", icon: <FiCheckCircle /> },
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  // Logic matched with CheckoutPage.js
  const subtotal = order.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0;
  const tax = subtotal * 0.13; // VAT 13%
  const delivery = 100; // Fixed delivery fee
  const total = subtotal + tax + delivery;

  return (
    <Container className="py-4">
      {/* HEADER ACTIONS */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <Button variant="outline-secondary" size="sm" className="mb-2" onClick={() => navigate(-1)}>
            ← Back to Fleet
          </Button>
          <h2 className="fw-bold mb-0">Order <span className="text-primary">#{order.id.substring(0, 8)}</span></h2>
          <small className="text-muted">Placed on {new Date(order.created_at).toLocaleString('en-GB')}</small>
        </div>

        <div className="d-flex gap-2">
          <Button variant="outline-dark" className="d-flex align-items-center gap-2">
            <FiPrinter /> Print Invoice
          </Button>
          <Button variant="primary" className="d-flex align-items-center gap-2">
            <FiMail /> Contact Customer
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* LEFT COLUMN: Order Items & Timeline */}
        <Col lg={8}>
          {/* Status Tracker */}
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-4">Order Progress</h6>
              <div className="status-timeline d-flex justify-content-between position-relative">
                {['pending', 'paid', 'shipped', 'delivered'].map((s, idx) => (
                  <div key={idx} className={`text-center position-relative ${order.status === s ? 'active' : ''}`} style={{ zIndex: 2, flex: 1 }}>
                    <div className={`status-dot mx-auto mb-2 ${Object.keys(statusMap).indexOf(order.status) >= idx ? 'bg-primary text-white' : 'bg-light'}`}>
                      {statusMap[s]?.icon || idx + 1}
                    </div>
                    <small className="fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>{s}</small>
                  </div>
                ))}
                <div className="progress-line" />
              </div>
            </Card.Body>
          </Card>

          {/* Items Table */}
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Header className="bg-white border-0 py-3">
              <h6 className="fw-bold mb-0">Package Contents ({order.items.length} items)</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 ps-4">Product</th>
                      <th className="border-0">Price</th>
                      <th className="border-0">Qty</th>
                      <th className="border-0 text-end pe-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-3">
                            <Image
                              src={item.product_image?.startsWith('http') ? item.product_image : `${apiClient.defaults.baseURL.replace('/api', '')}${item.product_image}`}
                              rounded
                              width={45}
                              height={45}
                              style={{ objectFit: 'cover' }}
                            />
                            <div>
                              <div className="fw-bold text-dark">{item.product_name}</div>
                              <small className="text-muted">SKU: {item.product_id}</small>
                            </div>
                          </div>
                        </td>
                        <td>Rs. {item.price}</td>
                        <td>x{item.quantity}</td>
                        <td className="text-end pe-4 fw-bold">Rs. {(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0 p-4">
              <div className="d-flex justify-content-end">
                <div style={{ width: '280px' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal</span>
                    <span className="fw-semibold">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">VAT (13%)</span>
                    <span className="fw-semibold">Rs. {tax.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Delivery Fee</span>
                    <span className="fw-semibold">Rs. {delivery.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Grand Total</span>
                    <span className="fw-bold text-primary fs-5">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card.Footer>
          </Card>
        </Col>

        {/* RIGHT COLUMN: Customer & Internal Controls */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 mb-4 bg-primary text-white">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">Update Order Status</h6>
              <Form.Select
                className="form-select-lg border-0 mb-2"
                value={order.status}
                disabled={updating}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                {Object.keys(statusMap).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </Form.Select>
              <small className="opacity-75">Update status to trigger customer notification.</small>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-light rounded-circle p-3">
                  <FiMapPin size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="fw-bold mb-0">Delivery Address</h6>
                  <small className="text-muted">Customer Details</small>
                </div>
              </div>
              <div className="fw-bold">{order.username}</div>
              <div className="text-muted small mb-3">{order.email}</div>
              <div className="p-3 bg-light rounded-3 text-secondary small">
                {order.full_name}<br />
                {order.address}<br />
                {order.district}, {order.province}<br />
                Phone: {order.phone}
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4 text-center">
              <div className={`display-6 mb-2 text-${statusMap[order.status].variant}`}>
                {statusMap[order.status].icon}
              </div>
              <h6 className="fw-bold">Payment Status: {order.status.toUpperCase()}</h6>
              <p className="text-muted small">Method: Online Wire Transfer</p>
              <Button variant="outline-primary" size="sm" className="w-100">Verify Payment</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminOrderDetail;