import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  const [isEditing, setIsEditing] = useState(false); // NEW: Toggle state
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
      setStatus({ type: 'danger', msg: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);

      // Use conditional appends to avoid sending empty strings if not needed
      if (formData.phone) data.append('phone', formData.phone);
      if (formData.bio) data.append('bio', formData.bio);
      if (formData.password) data.append('password', formData.password);

      // Profile Image check
      if (profileImage) {
        data.append('profile_image', profileImage);
      }

      const response = await userApi.updateProfile(data);

      // FastAPI returns { "user": ..., "access_token": ... }
      const { user: updatedUser, access_token } = response.data;

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('token', access_token);

      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setStatus({ type: 'danger', msg: err.response?.data?.detail || 'Update failed.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await userApi.deleteProfile();
      logout();
    } catch (err) {
      setStatus({ type: 'danger', msg: 'Failed to delete account.' });
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-dashboard-bg py-5">
      <Container>
        <Row className="g-4">
          {/* LEFT: Profile Overview */}
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
                    {isEditing && (
                      <button type="button" className="edit-avatar-btn" onClick={() => fileInputRef.current.click()}>
                        <i className="bi bi-camera-fill"></i>
                      </button>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
                </div>

                <h4 className="fw-bold mt-3 mb-1">{formData.username || 'Bazaar User'}</h4>
                <p className="text-muted small mb-3">{formData.email}</p>
                <Badge bg="soft-primary" className="text-primary rounded-pill px-3 mb-4">Verified Member</Badge>

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
                {!isEditing ? (
                  <Button
                    variant="outline-secondary"
                    className="rounded-pill px-4"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="bi bi-pencil-square me-2"></i>Edit Profile
                  </Button>
                ) : (
                  <Badge bg="warning" className="text-dark p-2 px-3 rounded-pill">Editing Mode</Badge>
                )}
              </div>

              {status.msg && <Alert variant={status.type} className="border-0 rounded-4">{status.msg}</Alert>}

              <Form onSubmit={handleSave}>
                <h6 className="text-primary text-uppercase small fw-bold mb-4">Basic Information</h6>
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Username</Form.Label>
                      <Form.Control
                        disabled={!isEditing}
                        className="custom-input"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Phone Number</Form.Label>
                      <Form.Control
                        disabled={!isEditing}
                        className="custom-input"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="small fw-bold text-muted">Biography</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        disabled={!isEditing}
                        className="custom-input"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {isEditing && (
                  <>
                    <hr className="my-5 opacity-10" />
                    <h6 className="text-primary text-uppercase small fw-bold mb-4">Security</h6>
                    <Row className="g-3 mb-5">
                      <Col md={6}>
                        <Form.Control type="password" placeholder="New Password" name="password" onChange={handleChange} />
                      </Col>
                      <Col md={6}>
                        <Form.Control type="password" placeholder="Confirm Password" name="confirmPassword" onChange={handleChange} />
                      </Col>
                    </Row>
                  </>
                )}

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 bg-light p-4 rounded-4">
                  <div>
                    <h6 className="fw-bold mb-1 text-danger">Danger Zone</h6>
                    <p className="small text-muted mb-0">Permanently delete your account.</p>
                  </div>
                  <Button
                    type="button" // CRITICAL: Prevents Save from firing
                    variant="danger"
                    className="rounded-circle p-3 d-flex align-items-center justify-content-center shadow"
                    style={{ width: '50px', height: '50px' }}
                    onClick={() => setShowDeleteModal(true)}
                    disabled={loading}
                  >
                    <i className="bi bi-trash3-fill"></i>
                  </Button>
                </div>

                {isEditing && (
                  <div className="text-end mt-5">
                    <Button
                      variant="light"
                      className="me-2 rounded-pill px-4"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading} className="px-5 py-2 rounded-pill shadow-lg fw-bold">
                      {loading ? <Spinner size="sm" /> : <><i className="bi bi-check2-circle me-2"></i>Save Changes</>}
                    </Button>
                  </div>
                )}
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Body className="p-5 text-center">
          <div className="text-danger mb-4"><i className="bi bi-exclamation-triangle-fill fs-1"></i></div>
          <h3 className="fw-bold">Delete Account?</h3>
          <p className="text-muted">This action is permanent and cannot be undone.</p>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" className="rounded-pill px-4" onClick={handleDeleteAccount} disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Confirm Delete'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AccountSettings;