import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext'; // NEW: global cart context

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/admin/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import UserProfile from './pages/UserProfile';
import AccountSettings from './pages/admin/AccountSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminFlashDeals from './pages/admin/AdminFlashDeals';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import CartPage from './pages/CartPage';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CheckoutPage from './pages/CheckoutPage';
import FlashDeals from './pages/FlashDeals';
import ContactUs from './pages/ContactUs';
import HelpCenter from './pages/HelpCenter';
import Privacy from './pages/Privacy';
import AboutUs from './pages/AboutUs';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Routes>

              {/* ---------------- ADMIN PANEL ---------------- */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:orderId" element={<AdminOrderDetail />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="flash-deals" element={<AdminFlashDeals />} />
              </Route>

              {/* Admin login (standalone) */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* ---------------- PUBLIC & USER ROUTES ---------------- */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <div className="main-content">
                      <Routes>
                        <Route index element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/shop" element={<Products />} />
                        <Route path="/products/:slug" element={<ProductDetail />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/profile" element={<UserProfile />} />
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/settings" element={<AccountSettings />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/flash-deals" element={<FlashDeals />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/help" element={<HelpCenter />} />
                        <Route path="/privacy" element={<Privacy />} />

                        {/* USER DASHBOARD: Only for logged-in users */}
                        <Route
                          path="/dashboard"
                          element={
                            <RequireAuth>
                              <UserDashboard />
                            </RequireAuth>
                          }
                        />

                        {/* 404 fallback */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </div>
                    <Footer />
                  </>
                }
              />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
