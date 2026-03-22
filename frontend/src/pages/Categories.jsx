import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap'
import { categoryApi } from '../utils/categoryApi'
import AOS from 'aos'
import { Link } from 'react-router-dom'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    AOS.init()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const cats = await categoryApi.getAll() // Already returns data thanks to interceptor
      setCategories(Array.isArray(cats) ? cats : [])
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      setError('Unable to load categories. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="user-main-content">
      <Container className="py-4">
        <h2 className="fw-bold mb-4" data-aos="fade-down">Shop by Category</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center text-muted py-5">No categories available.</p>
        ) : (
          <Row className="g-4">
            {categories.map(cat => (
              <Col key={cat.id} xs={12} sm={6} md={4} lg={3} data-aos="fade-up">
                <Card className="shadow-sm h-100 border-0 category-card">
                  <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                    <h5 className="fw-bold mb-2">{cat.name}</h5>
                    <Link 
                      to={`/products?category=${cat.id}`} 
                      className="btn btn-outline-primary btn-sm mt-2"
                    >
                      View Products
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  )
}

export default Categories
