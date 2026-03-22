import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import '../styles/auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const { register } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) errors.email = 'Enter a valid email'
    if (formData.username.length < 3) errors.username = 'Minimum 3 characters'
    if (formData.password.length < 6) errors.password = 'Minimum 6 characters'
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords mismatch'
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return
    setLoading(true)

    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' })
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100 py-5">
          <Col md={9} lg={7} xl={6}>
            <Card className="auth-card border-0 shadow-xl" style={{maxWidth: "600px", margin: "0 auto"}}>
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-5">
                  <div className="brand-logo-container mb-3 bg-success-gradient">
                    <img src="/logo.png" alt="Logo" className="brand-logo" width={"50px"} />
                  </div>
                  <h2 className="fw-bold text-dark">Create Account</h2>
                  <p className="text-secondary">Join the NGAU Bazaar community today</p>
                </div>

                {error && (
                  <Alert variant="danger" className="border-0 rounded-4 mb-4">
                    <i className="bi bi-exclamation-circle-fill me-2"></i>{error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted text-uppercase">Email Address</Form.Label>
                        <InputGroup className={`custom-input-group ${validationErrors.email ? 'is-invalid' : ''}`}>
                          <InputGroup.Text className="bg-transparent border-end-0">
                            <i className="bi bi-envelope text-success"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="email"
                            name="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!validationErrors.email}
                            className="border-start-0 ps-0"
                          />
                          <Form.Control.Feedback type="invalid">{validationErrors.email}</Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    
                    <Col md={12}>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted text-uppercase">Username</Form.Label>
                        <InputGroup className={`custom-input-group ${validationErrors.username ? 'is-invalid' : ''}`}>
                          <InputGroup.Text className="bg-transparent border-end-0">
                            <i className="bi bi-at text-success"></i>
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="username"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={handleChange}
                            isInvalid={!!validationErrors.username}
                            className="border-start-0 ps-0"
                          />
                          <Form.Control.Feedback type="invalid">{validationErrors.username}</Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted text-uppercase">Password</Form.Label>
                        <InputGroup className="custom-input-group">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="••••••"
                            value={formData.password}
                            onChange={handleChange}
                            isInvalid={!!validationErrors.password}
                          />
                          <Form.Control.Feedback type="invalid">{validationErrors.password}</Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted text-uppercase">Confirm</Form.Label>
                        <InputGroup className="custom-input-group">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            isInvalid={!!validationErrors.confirmPassword}
                          />
                          <InputGroup.Text 
                            className="bg-transparent cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                          </InputGroup.Text>
                          <Form.Control.Feedback type="invalid">{validationErrors.confirmPassword}</Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    variant="success"
                    type="submit"
                    disabled={loading}
                    className="w-100 py-3 rounded-3 fw-bold shadow-success mt-3 register-btn"
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : 'Create My Account'}
                  </Button>
                </Form>

                <div className="text-center mt-5">
                  <p className="text-muted small">
                    Already part of the bazaar?{' '}
                    <Link to="/login" className="text-success fw-bold text-decoration-none">Log In</Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Register