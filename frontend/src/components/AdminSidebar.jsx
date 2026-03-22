import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  // Helper to check if a link is active to apply custom styles
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="admin-sidebar shadow-sm">
      <div className="admin-brand">
        <i className="bi bi-shop-window me-2"></i>
        <span>Bazaar <span className="text-dark">Admin</span></span>
      </div>

      <div className="sidebar-content d-flex flex-column justify-content-between h-100">
        <Nav className="flex-column px-3 mt-3">
          <small className="text-uppercase text-muted fw-bold mb-2 px-3" style={{ fontSize: '0.7rem' }}>
            Main Menu
          </small>
          
          <Nav.Link 
            as={Link} 
            to="/admin" 
            className={`admin-nav-item ${isActive('/admin') ? 'active' : ''}`}
          >
            <i className="bi bi-speedometer2 me-3"></i> Dashboard
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/admin/products" 
            className={`admin-nav-item ${isActive('/admin/products') ? 'active' : ''}`}
          >
            <i className="bi bi-box-seam me-3"></i> Products
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/admin/categories" 
            className={`admin-nav-item ${isActive('/admin/categories') ? 'active' : ''}`}
          >
            <i className="bi bi-tags me-3"></i> Categories
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/admin/orders" 
            className={`admin-nav-item ${isActive('/admin/orders') ? 'active' : ''}`}
          >
            <i className="bi bi-receipt me-3"></i> Orders
          </Nav.Link>

          <hr className="mx-3 my-4 text-muted" />

          <small className="text-uppercase text-muted fw-bold mb-2 px-3" style={{ fontSize: '0.7rem' }}>
            User Management
          </small>

          <Nav.Link 
            as={Link} 
            to="/admin/users" 
            className={`admin-nav-item ${isActive('/admin/users') ? 'active' : ''}`}
          >
            <i className="bi bi-people me-3"></i> Customers
          </Nav.Link>
        </Nav>

        {/* Bottom Actions */}
        <div className="px-3 mb-4">
          <Nav.Link 
            as={Link} 
            to="/" 
            className="admin-nav-item text-danger"
          >
            <i className="bi bi-box-arrow-left me-3"></i> Exit to Store
          </Nav.Link>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;