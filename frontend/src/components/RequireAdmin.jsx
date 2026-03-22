import { Navigate, useLocation } from 'react-router-dom'
import { Spinner, Container, Card, Button } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'

const RequireAdmin = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="danger" />
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </Container>
    )
  }

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!isAdmin()) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Card className="text-center shadow" style={{ maxWidth: '500px' }}>
          <Card.Body className="p-5">
            <div className="text-danger mb-3">
              <i className="bi bi-shield-exclamation" style={{ fontSize: '4rem' }}></i>
            </div>
            <Card.Title className="text-danger mb-3">Access Denied</Card.Title>
            <Card.Text className="text-muted mb-4">
              You don't have administrator privileges to access this page.
            </Card.Text>
            <Button variant="primary" href="/">
              <i className="bi bi-house-door me-2"></i>
              Go to Home
            </Button>
          </Card.Body>
        </Card>
      </Container>
    )
  }

  return children
}

export default RequireAdmin