import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../utils/productApi'; // Ensure this has getWishlist()
import ProductCard from '../components/ProductCard';
import AOS from 'aos';

const WishlistPage = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const data = await productApi.getWishlist(); // Calls GET /wishlist/
            setWishlistItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        AOS.init({ duration: 800 });
        fetchWishlist();
    }, []);

    // Function to remove item from list locally after toggle
    const handleRemoveFromList = (productId) => {
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
    };

    if (loading) return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <Container className="py-5 min-vh-100">
            <div className="d-flex justify-content-between align-items-end mb-5" data-aos="fade-down">
                <div>
                    <h1 className="fw-bold display-5">My Wishlist</h1>
                    <p className="text-muted">Items you've saved for later</p>
                </div>
                <Button variant="outline-primary" onClick={() => navigate('/shop')}>
                    Continue Shopping
                </Button>
            </div>

            {wishlistItems.length > 0 ? (
                <Row className="g-4">
                    {wishlistItems.map((item) => (
                        <Col key={item.id} xs={12} sm={6} md={4} lg={3} data-aos="fade-up">
                            {/* Pass a callback so the card disappears when un-hearted */}
                            <ProductCard 
                                product={item} 
                                onWishlistToggle={() => handleRemoveFromList(item.id)} 
                            />
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="text-center py-5" data-aos="zoom-in">
                    <i className="bi bi-heart text-light display-1 mb-4"></i>
                    <h3 className="fw-bold">Your wishlist is empty</h3>
                    <p className="text-muted mb-4">Save items you like to see them here.</p>
                    <Button variant="primary" size="lg" onClick={() => navigate('/shop')}>
                        Explore Products
                    </Button>
                </div>
            )}
        </Container>
    );
};

export default WishlistPage;