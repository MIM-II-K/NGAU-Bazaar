import { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { productApi } from '../../utils/productApi';
import AOS from 'aos';

const API_BASE_URL = "https://ngau-bazaar.onrender.com";
const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='10' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagesToRemove, setImagesToRemove] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Form State - Initialized with empty strings to keep inputs 'controlled'
  const [formData, setFormData] = useState({
    name: '', price: '', unit: 'pc', category_id: '', quantity: '', files: [], description: '', tags: []
  });

  useEffect(() => {
    loadCategories();
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage]);

  const loadCategories = async () => {
    try {
      const res = await productApi.getCategories();
      const data = res.data || res || [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Categories load error:", err);
      setCategories([]);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await productApi.getAll({ page: currentPage, limit: limit });
      const data = res.data || res || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Products load error:", err);
      setProducts([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // 1. FIXED: Explicit Mapping
    data.append('name', formData.name || '');
    data.append('price', String(formData.price || '0'));
    data.append('unit', formData.unit || 'pc');
    data.append('category_id', formData.category_id || '');
    data.append('quantity', String(formData.quantity || '0'));
    data.append('stock', String(formData.quantity || '0'));
    data.append('description', formData.description || '');
    
    // Stringify tags for FastAPI's JSONB/String parsing
    data.append('tags', formData.tags ? formData.tags.join(',') : '');

    // Add list of image IDs to be removed from the gallery
    if (imagesToRemove.length > 0){
      data.append('remove_image_ids', imagesToRemove.join(','));
    }

    // 2. Append Multiple Files Correctly
    if (formData.files && formData.files.length > 0) {
      formData.files.forEach(file => {
        data.append('files', file); 
      });
    }

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, data);
      } else {
        await productApi.create(data);
      }
      
      setShowModal(false);
      loadProducts();

      // Reset form to empty state (controlled)
      setFormData({ 
        name: '', price: '', unit: 'pc', category_id: '', 
        quantity: '', files: [], description: '', tags: [] 
      });
      setImagesToRemove([]);

    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      alert("Upload failed: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await productApi.delete(id);
        loadProducts();
      } catch (err) { alert(err.message); }
    }
  };

  // Helper to handle tag changes
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      e.preventDefault();
      const newTag = e.target.value.trim().toLowerCase();
      if (!formData.tags.includes(newTag)) {
        setFormData({ ...formData, tags: [...formData.tags, newTag] });
      }
      e.target.value = ''; 
    }
  };

  const removeTag = (indexToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, index) => index !== indexToRemove)
    });
  };

  const toggleImageRemoval = (imageId) => {
    if (imagesToRemove.includes(imageId)) {
      setImagesToRemove(imagesToRemove.filter(id => id !== imageId));
    } else {
      setImagesToRemove([...imagesToRemove, imageId]);
    }
  }

  return (
    <div className="admin-main-content">
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4" data-aos="fade-down">
          <div>
            <h2 className="fw-bold">Inventory Management</h2>
            <p className="text-muted">Viewing Page {currentPage}</p>
          </div>
          <Button variant="primary" className="btn-modern shadow-sm" onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', price: '', category_id: '', quantity: '', files: [], description: '', unit: 'pc', tags: [] });
            setImagesToRemove([]);
            setShowModal(true);
          }}>
            <i className="bi bi-plus-lg me-2"></i> Add New Product
          </Button>
        </div>

        <div className="bg-white rounded-4 shadow-sm overflow-hidden" data-aos="fade-up">
          <Table hover responsive className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th className="text-end px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products?.length > 0 ? products.map(p => (
                <tr key={p.id}>
                  <td className="px-4">
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          p.images?.length > 0
                            ? p.images[0].url.startsWith('http')
                              ? p.images[0].url
                              : `${API_BASE_URL}${p.images[0].url}`
                            : fallbackImage
                        }
                        alt={p.name}
                        className="rounded-3 me-3"
                        style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                        onError={e => { e.currentTarget.src = fallbackImage; }}
                      />
                      <span className="fw-semibold text-dark">{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <Badge bg="info" className="text-white">
                      {p.category?.name || 'Uncategorized'}
                    </Badge>
                  </td>
                  <td className="fw-bold">Rs.{p.price}</td>
                  <td>
                    <span className={p.quantity < 5 ? "text-danger fw-bold" : "text-dark"}>
                      {p.quantity} <small className="text-muted">{p.unit}</small>
                    </span>
                  </td>
                  <td className="text-end px-4">
                    <Button variant="link" className="text-primary me-2" onClick={() => {
                      setEditingProduct(p);
                      setFormData({ ...p, files: [], tags: p.tags || [] });
                      setImagesToRemove([]);
                      setShowModal(true);
                    }}>
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button variant="link" className="text-danger" onClick={() => handleDelete(p.id)}>
                      <i className="bi bi-trash3"></i>
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">No products found.</td>
                </tr>
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-light border-top">
            <Button
              variant="outline-secondary" size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <span className="fw-bold">Page {currentPage}</span>
            <Button
              variant="outline-secondary" size="sm"
              disabled={products?.length < limit}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="px-4 pb-4">
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Product Name</Form.Label>
                  <Form.Control required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Tags (Press Enter)</Form.Label>
                  <div className="border rounded p-2 bg-light">
                    {formData.tags?.map((tag, idx) => (
                      <Badge key={idx} bg="primary" className="me-1" style={{ cursor: 'pointer' }} onClick={() => removeTag(idx)}>
                        {tag} &times;
                      </Badge>
                    ))}
                    <Form.Control 
                      className="border-0 bg-transparent shadow-none" 
                      placeholder="Add tag..." 
                      onKeyDown={handleTagInput} 
                    />
                  </div>
                </Form.Group>
              </Col>

              {/* Existing Images Gallery Section */}
              {editingProduct && editingProduct.images?.length > 0 && (
                <Col md={12}>
                  <Form.Label className="small fw-bold text-uppercase text-muted">Current Product Gallery</Form.Label>
                  <div className="d-flex flex-wrap gap-2 p-2 border rounded bg-light">
                    {editingProduct.images.map((img) => (
                      <div key={img.id} className="position-relative shadow-sm" style={{ width: '80px', height: '80px' }}>
                        <img
                          src={img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`}
                          alt="existing"
                          className={`rounded border w-100 h-100 ${imagesToRemove.includes(img.id) ? 'opacity-25 grayscale' : ''}`}
                          style={{ objectFit: 'cover', transition: '0.3s' }}
                        />
                        <Button
                          variant={imagesToRemove.includes(img.id) ? "success" : "danger"}
                          size="sm"
                          className="position-absolute top-0 end-0 rounded-circle d-flex align-items-center justify-content-center p-0"
                          style={{ width: '22px', height: '22px', marginTop: '-8px', marginRight: '-8px' }}
                          onClick={() => toggleImageRemoval(img.id)}
                        >
                          {imagesToRemove.includes(img.id) ? <i className="bi bi-plus"></i> : <i className="bi bi-x"></i>}
                        </Button>
                      </div>
                    ))}
                  </div>
                  <small className="text-muted mt-1 d-block">Images faded with an 'X' will be deleted when you save.</small>
                </Col>
              )}

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Price Configuration</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">Rs.</span>
                    <Form.Control
                      required type="number" step="0.01"
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                    />
                    <span className="input-group-text">per</span>
                    <Form.Select
                      value={formData.unit || 'pc'}
                      onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    >
                      <optgroup label="Solid/Weight">
                        <option value="5kg">5 (kg)</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="g">Gram (g)</option>
                        <option value="500g">500 (g)</option>
                        <option value="250g">250 (g)</option>
                        <option value="200g">200 (g)</option>
                        <option value="100g">100 (g)</option>
                        <option value="50g">50 (g)</option>
                      </optgroup>
                      <optgroup label="Liquid/Volume">
                        <option value="liter">Liter (L)</option>
                        <option value="ml">Milliliter (ml)</option>
                        <option value="500ml">500 (ml)</option>
                        <option value="250ml">250 (ml)</option>
                      </optgroup>
                      <optgroup label="Individual/Count">
                        <option value="pc">Piece (pc)</option>
                        <option value="pkt">Packet (pkt)</option>
                        <option value="dz">Dozen (12pcs) (dz)</option>
                      </optgroup>
                    </Form.Select>
                  </div>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Stock Quantity</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      required type="number"
                      value={formData.quantity || ''}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    />
                    <span className="input-group-text bg-light">{formData.unit}</span>
                  </div>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Category</Form.Label>
                  <Form.Select required value={formData.category_id || ''} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Description</Form.Label>
                  <Form.Control
                    as="textarea" rows={3}
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Upload New Images</Form.Label>
                  <Form.Control
                    type="file" multiple
                    onChange={e => setFormData({ ...formData, files: Array.from(e.target.files) })}
                  />
                  {formData.files?.length > 0 && (
                    <small className="text-primary d-block mt-1">
                      {formData.files.length} new files selected
                    </small>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button variant="light" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="primary">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;