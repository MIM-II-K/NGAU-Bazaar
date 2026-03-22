import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Container, Nav, Button, Navbar } from 'react-bootstrap'
import { useState } from 'react'
import '../styles/admin-layout.css'

const AdminLayout = () => {
  const { logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const menuItems = [
    { path: '/admin/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    { path: '/admin/products', icon: 'bi-box-seam', label: 'Inventory' },
    { path: '/admin/orders', icon: 'bi-receipt', label: 'Orders' },
    { path: '/admin/users', icon: 'bi-people', label: 'Customers' },
    { path: '/admin/flash-deals', icon: 'bi-lightning-charge-fill', label: 'Flash Deals' },
  ]

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/')

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-container">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header text-center">
          <h4 className="fw-bold text-primary">NGAU ADMIN</h4>
          <small className="text-muted">System Management</small>
        </div>

        <Nav className="flex-column gap-2">
          {menuItems.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${
                isActive(item.path) ? 'active-link' : ''
              }`}
            >
              <i className={`bi ${item.icon} me-3`} />
              {item.label}
            </Nav.Link>
          ))}
        </Nav>

        <div className="mt-auto pt-4">
          <Button
            variant="outline-danger"
            className="w-100 rounded-pill"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left me-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-content">
        <Navbar bg="white" className="shadow-sm px-3 py-3">
          <Button
            variant="light"
            className="d-md-none me-3"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="bi bi-list fs-4" />
          </Button>

          <h5 className="mb-0 fw-bold">Command Center</h5>

          <div className="ms-auto d-flex align-items-center">
            <span className="me-3 text-muted d-none d-sm-inline">
              Welcome, <strong>{user?.username}</strong>
            </span>
            <div className="admin-avatar">
              {user?.username?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </Navbar>

        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </main>
    </div>
  )
}

export default AdminLayout
