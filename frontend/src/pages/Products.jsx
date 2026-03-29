import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  InputGroup,
  Form,
  Pagination
} from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { productApi } from '../utils/productApi';
import { categoryApi } from '../utils/categoryApi';
import { addToCart } from '../utils/cartApi';
import { createSlug } from '../utils/urlHelper';
import { useCart } from '../contexts/CartContext';
import ToastMessage from '../components/ToastMessage';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../styles/products.css';

const API_BASE_URL = "https://ngau-bazaar.onrender.com";
const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCart } = useCart();

  const searchParams = new URLSearchParams(location.search);
  const urlCategoryId = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(urlCategoryId || 'all');

  // --- NEW: Sort State ---
  const [sortBy, setSortBy] = useState('newest');

  const [addingId, setAddingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    fetchCategories();
  }, []);

  // Reset to page 1 when filters OR sort changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchTerm, sortBy]);

  // Refetch when page, filters, or sort changes
  useEffect(() => {
    fetchProducts(page);
  }, [selectedCategory, searchTerm, page, categories, sortBy]);

  const fetchCategories = async () => {
    try {
      const cats = await categoryApi.getAll();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchProducts = async (currentPage = 1) => {
    setLoading(true);
    try {
      // Pass the sortBy state to your params
      const params = {
        page: currentPage,
        limit,
        sort: sortBy
      };

      if (selectedCategory && selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      if (searchTerm) params.search = searchTerm;

      const res = await productApi.getAll(params);

      const rawProducts = Array.isArray(res) ? res : [];

      const mappedProducts = rawProducts.map(p => {
        const categoryMatch = categories.find(c => c.id.toString() === p.category_id?.toString());
        return {
          ...p,
          stock: p.quantity,
          category_name: categoryMatch ? categoryMatch.name : (p.category_name || 'General')
        };
      });

      setProducts(mappedProducts);
      setTotalPages(mappedProducts.length < limit ? currentPage : currentPage + 1);
    } catch (err) {
      console.error('Failed to fetch products:', err.message);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (e, product) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      setToastMessage(`Sorry! ${product.name} is out of stock.`);
      setToastType('warning');
      setShowToast(true);
      return;
    }

    try {
      setAddingId(product.id);
      await addToCart(product.id, 1);
      await refreshCart();

      const updated = await productApi.getById(product.id);
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...updated, stock: updated.quantity } : p))
      );

      setToastMessage(`Added 1 x ${product.name} to cart!`);
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      setToastMessage(err.message || 'Failed to add to cart. Please login.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setAddingId(null);
    }
  };

  const handleBuyNow = async (e, product) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      setToastMessage(`Sorry! ${product.name} is out of stock.`);
      setToastType('warning');
      setShowToast(true);
      return;
    }

    try {
      setAddingId(product.id);
      await addToCart(product.id, 1);
      await refreshCart();
      navigate('/checkout');
    } catch (err) {
      setToastMessage(err.message || 'Failed to process. Please login.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setAddingId(null);
    }
  };

  const pillCategories = categories;

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];

    // Previous Button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="mx-1"
      />
    );

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => setPage(i)}
          className="mx-1"
        >
          {i}
        </Pagination.Item>
      );
    }

    // Next Button
    items.push(
      <Pagination.Next
        key="next"
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="mx-1"
      />
    );

    return (
      <div className="d-flex justify-content-center mt-5 mb-3" data-aos="fade-up">
        <Pagination className="custom-pagination">
          {items}
        </Pagination>
      </div>
    );
  };

  return (
    <div className="products-page-bg py-5">
      <Container>
        <div className="text-center mb-5" data-aos="fade-down">
          <Badge bg="soft-primary" className="text-primary px-3 py-2 mb-3">
            Fresh Market
          </Badge>
          <h1 className="display-5 fw-bold mb-4">
            Premium <span className="text-gradient">Bazaar</span> Collections
          </h1>

          {/* Master Control Bar: Search + Sort + Clear */}
          <div className="mx-auto mb-4" style={{ maxWidth: '900px' }} data-aos="fade-up">
            <div className="d-flex flex-column flex-md-row gap-3 align-items-center">
              <InputGroup className="shadow-lg rounded-pill overflow-hidden border-0 bg-white p-1 flex-grow-1">
                <InputGroup.Text className="bg-transparent border-0 ps-4">
                  <i className="bi bi-search text-primary" />
                </InputGroup.Text>

                <Form.Control
                  className="border-0 py-3 shadow-none fs-6"
                  placeholder="Search premium products..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    if (!e.target.value && selectedCategory === 'all') setSelectedCategory('all');
                  }}
                />

                {/* Integrated Sort Selector */}
                <div className="d-flex align-items-center pe-3 border-start my-2 ms-2">
                  <Form.Select
                    className="border-0 shadow-none bg-transparent fw-bold text-muted cursor-pointer"
                    style={{ width: 'auto', minWidth: '150px', fontSize: '0.85rem' }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Latest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A-Z</option>
                    <option value="popularity">Most Popular</option>
                  </Form.Select>
                </div>
              </InputGroup>

              {/* Primary Clear Button */}
              {(searchTerm || selectedCategory !== 'all' || sortBy !== 'newest') && (
                <Button
                  variant="link"
                  className="text-danger text-decoration-none fw-bold fade-in flex-shrink-0"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSortBy('newest');
                  }}
                >
                  <i className="bi bi-x-circle-fill me-1"></i> Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Full Category Navigation Bar (Sticky) */}
          <div className="filter-wrapper p-2 rounded-4 shadow-sm bg-white border border-light sticky-top mb-5"
            style={{ top: '20px', zIndex: 1020, backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255,255,255,0.9)' }}>

            <div className="category-scroll-container d-flex gap-2 overflow-auto py-1 px-2">
              <Button
                variant={selectedCategory === 'all' ? 'primary' : 'light'}
                className={`rounded-pill px-4 transition-all border-0 shadow-sm flex-shrink-0 ${selectedCategory === 'all' ? 'fw-bold' : 'text-muted'}`}
                onClick={() => setSelectedCategory('all')}
              >
                All Products
              </Button>

              {/* Render EVERY category from the database state */}
              {categories.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id.toString() ? 'primary' : 'light'}
                  className={`rounded-pill px-4 transition-all border-0 shadow-sm flex-shrink-0 whitespace-nowrap ${selectedCategory === cat.id.toString() ? 'fw-bold' : 'text-muted'}`}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                >
                  {cat.name}
                </Button>
              ))}

              {/* Secondary Clear Button (Appended to scroll list) */}
              {(searchTerm || selectedCategory !== 'all' || sortBy !== 'newest') && (
                <Button
                  variant="outline-danger"
                  className="rounded-pill px-4 border-0 shadow-sm flex-shrink-0 fw-bold ms-auto"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSortBy('newest');
                  }}
                >
                  <i className="bi bi-eraser-fill me-2"></i>
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Curating the best for you...</p>
          </div>
        ) : (
          <>
            <Row className="g-4">
              {products.length > 0 ? (
                products.map((product, index) => (
                  <Col key={product.id} sm={6} lg={4} xl={3} data-aos="fade-up" data-aos-delay={index * 40}>
                    <Card
                      className="h-100 border-0 shadow-sm product-card-modern"
                      onClick={() => navigate(`/products/${product.slug}`)}
                    >
                      <div className="image-zoom-container position-relative">
                        <Card.Img
                          variant="top"
                          src={
                            product.images && product.images.length > 0
                            ? product.images[0].url.startsWith('http')
                              ? product.images[0].url
                              : `${API_BASE_URL}${product.images[0].url}`
                            : fallbackImage}
                          onError={e => { e.currentTarget.src = fallbackImage; }}
                        />

                        {product.is_flash_deal && (
                          <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
                            <Badge bg="danger" className="shadow-sm">
                              <i className="bi bi-lightning-charge-fill me-1"></i>FLASH SALE
                            </Badge>
                            <Badge bg="warning" className="text-dark shadow-sm">
                              {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                            </Badge>
                          </div>
                        )}

                        <Badge
                          bg={product.stock > 0 ? 'success' : 'danger'}
                          className="position-absolute top-0 end-0 m-2 py-1 px-2"
                        >
                          {product.stock} in stock
                        </Badge>
                      </div>

                      <Card.Body className="d-flex flex-column p-4">
                        <div className="product-category-tag-wrapper mb-2 d-flex justify-content-between align-items-center">
                          <span className="category-label text-muted small text-uppercase fw-bold">
                            {product.category_name}
                          </span>

                          <div className="product-tags-mini d-flex flex-wrap justify-content-end gap-1">
                            {Array.isArray(product.tags) ? (
                              product.tags.map((tag, i) => (
                                <span key={i} className="tag-pill">
                                  #{tag}
                                </span>
                              ))
                            ) : (
                              product.tags && product.tags.split(',').map((tag, i) => (
                                <span key={i} className="tag-pill">
                                  #{tag.trim()}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <Card.Title className="fw-bold flex-grow-1">{product.name}</Card.Title>

                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-end mb-3">
                            <div className="d-flex flex-column">
                              {product.is_flash_deal ? (
                                <>
                                  <span className="text-muted text-decoration-line-through small">Rs. {product.price}</span>
                                  <span className="fw-bold text-danger fs-5">Rs. {product.discount_price}</span>
                                </>
                              ) : (
                                <span className="fw-bold text-primary fs-5">Rs. {product.price}</span>
                              )}
                              <small className="text-muted">/ {product.unit || 'pc'}</small>
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="flex-grow-1"
                              disabled={addingId === product.id || product.stock <= 0}
                              onClick={e => handleQuickAdd(e, product)}
                            >
                              {addingId === product.id ? (
                                <Spinner size="sm" />
                              ) : (
                                <><i className="bi bi-cart-plus me-1" />Cart</>
                              )}
                            </Button>

                            <Button
                              variant={product.is_flash_deal ? "danger" : "primary"}
                              size="sm"
                              className="flex-grow-1"
                              disabled={addingId === product.id || product.stock <= 0}
                              onClick={e => handleBuyNow(e, product)}
                            >
                              {product.stock <= 0 ? 'Out' : 'Buy Now'}
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12} className="text-center py-5">
                  <h4 className="text-muted">No products found</h4>
                </Col>
              )}
            </Row>

            {renderPagination()}
            {!loading && products.length > 0 && page === totalPages && (
              <div className="text-center mt-4 text-muted small">
                <hr className="w-25 mx-auto opacity-10" />
                <p>You've viewed all premium collections</p>
              </div>
            )}
          </>
        )}

        <ToastMessage
          show={showToast}
          onClose={() => setShowToast(false)}
          message={toastMessage}
          type={toastType}
        />
      </Container>
    </div>
  );
};

export default Products;