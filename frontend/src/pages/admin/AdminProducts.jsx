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

  // NEW: UX & Feedback States
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' }); // 'success' or 'danger'

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

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
    setLoading(true); // Start Loading UX
    setStatus({ type: '', msg: '' });

    const data = new FormData();
    data.append('name', formData.name || '');
    data.append('price', String(formData.price || '0'));
    data.append('unit', formData.unit || 'pc');
    data.append('category_id', formData.category_id || '');
    data.append('quantity', String(formData.quantity || '0'));
    data.append('stock', String(formData.quantity || '0'));
    data.append('description', formData.description || '');
    data.append('tags', formData.tags ? formData.tags.join(',') : '');

    if (imagesToRemove.length > 0){
      data.append('remove_image_ids', imagesToRemove.join(','));
    }

    if (formData.files && formData.files.length > 0) {
      formData.files.forEach(file => {
        data.append('files', file); 
      });
    }

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, data);
        setStatus({ type: 'success', msg: 'Product updated successfully!' });
      } else {
        await productApi.create(data);
        setStatus({ type: 'success', msg: 'New product created!' });
      }
      
      // Delay to show success message before closing
      setTimeout(() => {
        setShowModal(false);
        loadProducts();
        setFormData({ 
          name: '', price: '', unit: 'pc', category_id: '', 
          quantity: '', files: [], description: '', tags: [] 
        });
        setImagesToRemove([]);
        setLoading(false);
        setStatus({ type: '', msg: '' });
      }, 1500);

    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.detail || err.message;
      setStatus({ 
        type: 'danger', 
        msg: "Upload failed: " + (typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg) 
      });
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
            setStatus({ type: '', msg: '' });
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
                      setStatus({ type: '', msg: '' });
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

      <Modal show={showModal} onHide={() => !loading && setShowModal(false)} centered size="lg">
        <Modal.Header closeButton={!loading} className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="px-4 pb-4 position-relative">
            
            {/* CINEMATIC LOADING & TOAST OVERLAY */}
            {(loading || status.msg) && (
              <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-4" 
                   style={{ 
                     backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                     backdropFilter: 'blur(8px)', 
                     zIndex: 100,
                     transition: 'all 0.3s ease'
                   }}>
                <div className="text-center" data-aos="zoom-in">
                  {loading && !status.msg && (
                    <>
                      <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                      <h5 className="fw-bold text-dark">Processing...</h5>
                      <p className="text-muted small">Syncing with cloud storage</p>
                    </>
                  )}
                  {status.msg && (
                    <div className="p-4">
                      <div className={`bg-${status.type} text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} style={{ width: '60px', height: '60px' }}>
                        <i className={`bi bi-${status.type === 'success' ? 'check-lg' : 'exclamation-triangle'} fs-2`}></i>
                      </div>
                      <h5 className={`fw-bold text-${status.type === 'success' ? 'dark' : 'danger'}`}>{status.msg}</h5>
                      {status.type === 'danger' && (
                        <Button variant="outline-danger" size="sm" className="mt-2" onClick={() => setStatus({ type: '', msg: '' })}>
                          Try Again
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

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

              {editingProduct && editingProduct.images?.length > 0 && (
                <Col md={12}>
                  <Form.Label className="small fw-bold text-uppercase text-muted">Current Product Gallery</Form.Label>
                  <div className="d-flex flex-wrap gap-2 p-2 border rounded bg-light">
                    {editingProduct.images.map((img) => (
                      <div key={img.id} className="position-relative shadow-sm" style={{ width: '80px', height: '80px' }}>
                        <img
                          src={
                            img.url.startsWith('http')
                            ? img.url
                            : `${API_BASE_URL}${img.url}`
                          }
                          alt="existing"
                          className={`rounded border w-100 h-100 ${imagesToRemove.includes(img.id) ? 'opacity-25' : ''}`}
                          style={{ objectFit: 'cover', transition: '0.3s', filter: imagesToRemove.includes(img.id) ? 'grayscale(100%)' : 'none' }}
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
                        <option value="kg">Kilogram (kg)</option>
                        <option value="g">Gram (g)</option>
                        <option value="500g">500 (g)</option>
                      </optgroup>
                      <optgroup label="Liquid/Volume">
                        <option value="liter">Liter (L)</option>
                        <option value="ml">Milliliter (ml)</option>
                      </optgroup>
                      <optgroup label="Individual/Count">
                        <option value="pc">Piece (pc)</option>
                        <option value="pkt">Packet (pkt)</option>
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
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button variant="light" onClick={() => setShowModal(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;