import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import '../styles/auth.css'

const Login = () => {
  const [credentials, setCredentials] = useState({ email_or_username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(credentials, false)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }

  return (
    <div className="auth-wrapper">
      {/* Decorative background elements */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={8} lg={6} xl={5}>
            <Card className="auth-card border-0 shadow-xl" style={{maxWidth: "600px", margin: "0 auto"}}>
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-5">
                  <div className="brand-logo-container mb-3">
                    <img src="/logo.png" alt="Logo" className="brand-logo" width={"50px"} />
                  </div>
                  <h2 className="fw-bold text-dark">Welcome Back</h2>
                  <p className="text-secondary">Enter your details to access your dashboard</p>
                </div>

                {error && (
                  <Alert variant="danger" className="border-0 rounded-4 mb-4 d-flex align-items-center">
                    <i className="bi bi-exclamation-circle-fill me-2"></i>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-uppercase tracking-wider text-muted">Email or Username</Form.Label>
                    <InputGroup className="custom-input-group">
                      <InputGroup.Text className="bg-transparent border-end-0">
                        <i className="bi bi-person text-primary"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="email_or_username"
                        placeholder="Enter your email or username"
                        value={credentials.email_or_username}
                        onChange={handleChange}
                        required
                        className="border-start-0 ps-0"
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-semibold text-uppercase tracking-wider text-muted">Password</Form.Label>
                    <InputGroup className="custom-input-group">
                      <InputGroup.Text className="bg-transparent border-end-0">
                        <i className="bi bi-lock text-primary"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                        className="border-start-0 border-end-0 ps-0"
                      />
                      <InputGroup.Text 
                        className="bg-transparent border-start-0 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''} text-muted`}></i>
                      </InputGroup.Text>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 py-3 rounded-3 fw-bold shadow-primary mt-2 login-btn"
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : 'Sign In'}
                  </Button>
                </Form>

                <div className="text-center mt-4">
                  <p className="small text-muted mb-0">
                    Don't have an account? <Link to="/register" className="text-primary fw-bold text-decoration-none hover-underline">Create one</Link>
                  </p>
                </div>
                <div className="text-center mt-3">
                  <Link to="/forgot-password" className="small text-muted text-decoration-none hover-underline">
                   <u>Forgot your password?</u>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login