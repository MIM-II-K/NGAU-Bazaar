import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Navbar as BSNavbar, Nav, Container, Button, Offcanvas, Dropdown } from 'react-bootstrap'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext' // Use global context for consistency
import '../styles/navbar.css'

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount, refreshCart } = useCart() // Dynamic count from Context
  const navigate = useNavigate()
  const location = useLocation()
  
  const [showSidebar, setShowSidebar] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Sync cart count on navigation or user change
  useEffect(() => {
    refreshCart()
  }, [location.pathname, user])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setShowSidebar(false)
    refreshCart()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className={`navbar-fixed-wrapper ${scrolled ? 'is-scrolled' : ''}`}>
      <BSNavbar expand="lg" className="navbar-main">
        <Container fluid className="px-3 px-md-5">
          <div className="navbar-mobile-container">
            
            {/* LEFT: Logo Section */}
            <div className="nav-left-zone">
              <BSNavbar.Brand as={Link} to="/shop" className="d-flex align-items-center m-0">
                <img src="/logo_b.png" alt="Logo" width="42px" />
                <strong className="ms-2 brand-text">
                  NGAU<span className="text-primary">BAZAAR</span>
                </strong>
              </BSNavbar.Brand>
            </div>

            {/* CENTER: Desktop Links (Pill Style) */}
            <div className="nav-center-zone d-none d-lg-flex">
              <Nav className="pill-nav">
                <Nav.Link as={Link} to="/" className={isActive('/') ? 'active' : ''}>Home</Nav.Link>
                <Nav.Link as={Link} to="/shop" className={isActive('/shop') ? 'active' : ''}>Shop</Nav.Link>
                <Nav.Link as={Link} to="/flash-deals" className={isActive('/flash-deals') ? 'active' : ''}>Deals</Nav.Link>
              </Nav>
            </div>

            {/* RIGHT: Actions Section */}
            <div className="nav-right-zone">
              {/* NEW CART ICON: bi-cart3 for a modern retail look */}
              <Link to="/cart" className="nav-action-btn cart-btn-wrapper">
                <i className="bi bi-cart3"></i>
                {cartCount > 0 && (
                  <span className="cart-badge-dot animate__animated animate__pulse animate__infinite">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Desktop Auth Section */}
              <div className="d-none d-lg-flex align-items-center ms-1">
                {isAuthenticated() ? (
                  <Dropdown align="end" className="profile-dropdown">
                    <Dropdown.Toggle variant="none" className="p-0 border-0 shadow-none">
                      <div className="nav-avatar">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu-modern shadow-lg border-0">
                      <div className="dropdown-header-custom px-3 py-2">
                        <p className="mb-0 fw-bold">{user?.username}</p>
                        <small className="text-muted">{user?.email || 'Customer'}</small>
                      </div>
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to={isAdmin() ? "/admin/dashboard" : "/dashboard"}>
                        <i className="bi bi-grid-1x2 me-2"></i> Dashboard
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout} className="text-danger">
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Button as={Link} to="/login" variant="primary" className="btn-join rounded-pill px-4">
                    Sign In
                  </Button>
                )}
              </div>

              {/* MODERN HAMBURGER: Minimalist 2-bar toggle */}
              <button 
                className={`hamburger-toggle d-lg-none ${showSidebar ? 'active' : ''}`} 
                onClick={() => setShowSidebar(true)}
              >
                <span className="bar"></span>
                <span className="bar short"></span>
              </button>
            </div>

          </div>
        </Container>
      </BSNavbar>

      {/* MOBILE SIDEBAR */}
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="end" className="mobile-sidebar">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">
            NGAU<span className="text-primary">BAZAAR</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        
        <Offcanvas.Body className="d-flex flex-column">
          <Nav className="flex-column gap-2">
            <Link to="/shop" className="sidebar-item" onClick={() => setShowSidebar(false)}>
              <i className="bi bi-shop"></i> Shop
            </Link>
            <Link to="/cart" className="sidebar-item" onClick={() => setShowSidebar(false)}>
              <i className="bi bi-cart3"></i> My Cart ({cartCount})
            </Link>
            <Link to="/flash-deals" className="sidebar-item" onClick={() => setShowSidebar(false)}>
              <i className="bi bi-lightning-charge"></i> Flash Deals
            </Link>
            <Link to="/dashboard" className="sidebar-item" onClick={() => setShowSidebar(false)}>
              <i className="bi bi-person"></i> Profile
            </Link>
          </Nav>
          
          <div className="sidebar-footer mt-auto pt-4 border-top">
            {!isAuthenticated() ? (
              <Button as={Link} to="/login" variant="primary" className="w-100 py-3 fw-bold rounded-4" onClick={() => setShowSidebar(false)}>
                Get Started
              </Button>
            ) : (
              <Button variant="outline-danger" className="w-100 py-3 fw-bold rounded-4" onClick={handleLogout}>
                Log Out
              </Button>
            )}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  )
}

export default Navbar