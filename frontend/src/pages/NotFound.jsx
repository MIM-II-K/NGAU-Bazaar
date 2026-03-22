import { Container, Button } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import AOS from 'aos'
import '../styles/notfound.css'

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <div className="notfound-wrapper">
      {/* Background Decorative Elements */}
      <div className="notfound-blob"></div>
      
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center z-index-1">
          <div className="error-code-container mb-4" data-aos="zoom-in">
            <h1 className="error-code">404</h1>
            <div className="ghost-icon">
              <i className="bi bi-ghost text-primary-gradient"></i>
            </div>
          </div>
          
          <div data-aos="fade-up" data-aos-delay="200">
            <h2 className="display-5 fw-bold text-dark mb-3">Lost in the Bazaar?</h2>
            <p className="text-secondary mb-5 mx-auto explorer-text">
              The page you're looking for seems to have vanished into thin air. 
              Let's get you back to the marketplace.
            </p>
            
            <div className="d-flex gap-3 justify-content-center flex-column flex-sm-row">
              <Button 
                onClick={() => navigate(-1)} 
                variant="light" 
                className="btn-modern px-4 py-3 border shadow-sm"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Go Back
              </Button>
              
              <Button 
                as={Link} 
                to="/" 
                className="btn-modern btn-primary-gradient px-5 py-3 shadow-lg"
              >
                <i className="bi bi-house-door me-2"></i>
                Back to Home
              </Button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="mt-5 pt-4" data-aos="fade-up" data-aos-delay="400">
            <p className="small text-uppercase tracking-widest text-muted fw-bold mb-3">Popular Destinations</p>
            <div className="d-flex justify-content-center gap-4 text-primary fw-semibold">
              <Link to="/products" className="notfound-link">Products</Link>
              <Link to="/categories" className="notfound-link">Categories</Link>
              <Link to="/help" className="notfound-link">Support</Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default NotFound