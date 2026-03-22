import { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { categoryApi } from '../../utils/categoryApi';
import AOS from 'aos';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
    AOS.init();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryApi.getAll();
      setCategories(response);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newCategory.trim()) {
      setError("Category name cannot be empty");
      return;
    }

    try {
      await categoryApi.create({ name: newCategory.trim() });
      setSuccess(`Category "${newCategory}" created successfully`);
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      console.error("Failed to create category", err);
      setError(err.response?.data?.detail || "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? This cannot be undone.`)) return;

    try {
      await categoryApi.delete(id);
      setSuccess(`Category "${name}" deleted successfully`);
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete category", err);
      setError(err.response?.data?.detail || "Failed to delete category");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  return (
    <div className="admin-main-content">
      <Container className="py-4">
        <h2 className="fw-bold mb-4" data-aos="fade-down">Manage Categories</h2>

        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

        {/* Add Category Form */}
        <Card className="mb-4 shadow-sm border-0" data-aos="fade-up">
          <Card.Body>
            <Form onSubmit={handleAddCategory}>
              <Row className="g-2 align-items-center">
                <Col md={8}>
                  <Form.Control 
                    type="text" 
                    placeholder="New Category Name" 
                    value={newCategory} 
                    onChange={(e) => setNewCategory(e.target.value)} 
                  />
                </Col>
                <Col md={4}>
                  <Button type="submit" variant="primary" className="w-100">Add Category</Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Categories List */}
        <Card className="shadow-sm border-0" data-aos="fade-up">
          <Card.Body>
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length ? categories.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>{cat.name}</td>
                    <td className="text-end">
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="text-center text-muted py-3">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AdminCategories;
