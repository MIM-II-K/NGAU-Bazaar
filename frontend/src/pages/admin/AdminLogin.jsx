import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/auth.css'

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    email_or_username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/admin'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(credentials, true) // true = admin login
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Access Denied. Invalid Administrator credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="auth-wrapper admin-bg">
      {/* Subtle Grid Pattern Overlay */}
      <div className="admin-grid-overlay"></div>
      
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100 py-5">
          <Col md={7} lg={5} xl={4}>
            <Card className="auth-card admin-card border-0 shadow-2xl">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-5">
                  <div className="admin-badge-icon mb-3">
                    <i className="bi bi-shield-lock"></i>
                  </div>
                  <h2 className="fw-bold text-dark tracking-tight">Admin Portal</h2>
                  <div className="d-flex align-items-center justify-content-center text-danger small fw-bold">
                    <span className="pulse-dot me-2"></span>
                    SECURE ACCESS ONLY
                  </div>
                </div>

                {error && (
                  <Alert variant="danger" className="border-0 rounded-4 small py-2 mb-4">
                    <i className="bi bi-shield-exclamation me-2"></i> {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Identification</Form.Label>
                    <InputGroup className="custom-input-group">
                      <InputGroup.Text className="bg-transparent border-end-0 text-muted">
                        <i className="bi bi-person-badge"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="email_or_username"
                        placeholder="Admin ID / Email"
                        value={credentials.email_or_username}
                        onChange={handleChange}
                        required
                        className="border-start-0 ps-0"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-5">
                    <Form.Label className="small fw-bold text-muted text-uppercase">Security Key</Form.Label>
                    <InputGroup className="custom-input-group">
                      <InputGroup.Text className="bg-transparent border-end-0 text-muted">
                        <i className="bi bi-key"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        className="border-start-0 border-end-0 ps-0"
                      />
                      <InputGroup.Text 
                        className="bg-transparent border-start-0 cursor-pointer text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    variant="danger"
                    type="submit"
                    disabled={loading}
                    className="w-100 py-3 rounded-3 fw-bold admin-submit-btn"
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>Verify Credentials</>
                    )}
                  </Button>
                </Form>

                <div className="text-center mt-5">
                  <Link to="/login" className="text-decoration-none text-muted small hover-danger">
                    <i className="bi bi-arrow-left me-2"></i>
                    Return to Standard Login
                  </Link>
                </div>
              </Card.Body>
            </Card>
            <p className="text-center text-muted-v2 mt-4 extra-small">
              System IP: {window.location.hostname} | Encryption: AES-256
            </p>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default AdminLogin