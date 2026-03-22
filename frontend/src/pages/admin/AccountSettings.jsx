import { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { userApi } from '../../utils/userApi';
import AOS from 'aos';
import '../../styles/accountSettings.css';

const AccountSettings = () => {
  const { user, setUser, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: '', email: '', phone: '', bio: '', password: '', confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      }));
      setPreviewUrl(user.profile_image_url || null);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setStatus({ type: 'danger', msg: 'Passwords do not match!' });
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      if (profileImage) data.append('profile_image', profileImage);

      const updatedUser = await userApi.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setStatus({ type: 'success', msg: 'Profile synchronized successfully!' });
    } catch (err) {
      setStatus({ type: 'danger', msg: err.message || 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-dashboard-bg py-5">
      <Container>
        <Row className="g-4">
          {/* LEFT: Profile Overview Card */}
          <Col lg={4} data-aos="fade-right">
            <Card className="profile-glass-card border-0 shadow-lg overflow-hidden">
              <div className="profile-banner"></div>
              <Card.Body className="text-center pt-0">
                <div className="profile-avatar-wrapper">
                  <div className="main-avatar shadow-lg">
                    {previewUrl ? (
                      <img src={previewUrl} alt="User" />
                    ) : (
                      <span className="avatar-initial">{formData.username?.charAt(0)}</span>
                    )}
                    <button className="edit-avatar-btn" onClick={() => fileInputRef.current.click()}>
                      <i className="bi bi-camera-fill"></i>
                    </button>
                  </div>
                  <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                </div>

                <h4 className="fw-bold mt-3 mb-1">{formData.username || 'Bazaar User'}</h4>
                <p className="text-muted small mb-3">{formData.email}</p>
                <Badge bg="soft-primary" className="text-primary rounded-pill px-3 mb-4">Verified Member</Badge>
                
                <div className="d-flex justify-content-around border-top border-bottom py-3 mb-4">
                  <div><h6 className="mb-0 fw-bold">12</h6><small className="text-muted">Orders</small></div>
                  <div><h6 className="mb-0 fw-bold">4</h6><small className="text-muted">Reviews</small></div>
                  <div><h6 className="mb-0 fw-bold">2</h6><small className="text-muted">Wishlist</small></div>
                </div>

                <div className="d-grid gap-2">
                  <Button variant="outline-primary" className="rounded-pill btn-sm">View Public Profile</Button>
                  <Button variant="link" className="text-danger btn-sm text-decoration-none" onClick={logout}>
                    <i className="bi bi-power me-2"></i>Sign Out
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT: Settings Form */}
          <Col lg={8} data-aos="fade-left">
            <Card className="border-0 shadow-lg rounded-4 p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Personal Settings</h3>
                <i className="bi bi-shield-check text-success fs-4"></i>
              </div>

              {status.msg && <Alert variant={status.type} className="border-0 rounded-4">{status.msg}</Alert>}

              <Form onSubmit={handleSave}>
                <h6 className="text-primary text-uppercase small fw-bold mb-4">Basic Information</h6>
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Username</Form.Label>
                      <Form.Control className="custom-input" name="username" value={formData.username} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Phone Number</Form.Label>
                      <Form.Control className="custom-input" name="phone" value={formData.phone} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Biography</Form.Label>
                      <Form.Control as="textarea" rows={3} className="custom-input" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
                    </Form.Group>
                  </Col>
                </Row>

                <hr className="my-5 opacity-10" />
                <h6 className="text-primary text-uppercase small fw-bold mb-4">Security & Password</h6>
                <Row className="g-3 mb-5">
                  <Col md={6}>
                    <Form.Control type="password" placeholder="New Password" className="custom-input" name="password" onChange={handleChange} />
                  </Col>
                  <Col md={6}>
                    <Form.Control type="password" placeholder="Confirm Password" className="custom-input" name="confirmPassword" onChange={handleChange} />
                  </Col>
                </Row>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 bg-light p-4 rounded-4">
                  <div>
                    <h6 className="fw-bold mb-1 text-danger">Danger Zone</h6>
                    <p className="small text-muted mb-0">Once you delete your account, there is no going back.</p>
                  </div>
                  <Button variant="danger" className="rounded-pill px-4" onClick={() => setShowDeleteModal(true)}>Delete Account</Button>
                </div>

                <div className="text-end mt-5">
                  <Button type="submit" variant="primary" disabled={loading} className="px-5 py-2 rounded-pill shadow-lg fw-bold">
                    {loading ? <Spinner size="sm" /> : 'Save Profile'}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modern Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered contentClassName="border-0 rounded-4 shadow-lg">
        <Modal.Body className="p-5 text-center">
          <div className="icon-badge-danger mb-4 mx-auto"><i className="bi bi-trash3-fill"></i></div>
          <h3 className="fw-bold">Delete Account?</h3>
          <p className="text-muted mb-4">All your data, credits, and history will be permanently erased. This cannot be undone.</p>
          <div className="d-flex gap-3 justify-content-center">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" className="rounded-pill px-4" onClick={logout}>Delete Forever</Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AccountSettings;