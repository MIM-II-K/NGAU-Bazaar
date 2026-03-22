import { Navigate, useLocation } from 'react-router-dom'
import { Spinner, Container } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </Container>
    )
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default RequireAuth