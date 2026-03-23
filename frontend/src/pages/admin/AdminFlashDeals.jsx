import { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Button, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import flashDealsApi from '../../utils/flashDealsApi';
import { adminApi } from '../../utils/adminApi';
import '../../styles/admin-flash-deals.css';

// --- SUB-COMPONENT: REAL-TIME COUNTDOWN ---
const CountdownTimer = ({ expiryDate }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculateTime = () => {
            const difference = new Date(expiryDate) - new Date();

            if (difference <= 0) {
                setTimeLeft("Expired");
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            const display = `${days > 0 ? days + 'd ' : ''}${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
            setTimeLeft(display);
        };

        const timer = setInterval(calculateTime, 1000);
        calculateTime();

        return () => clearInterval(timer);
    }, [expiryDate]);

    return (
        <span className={`fw-mono small ${timeLeft === "Expired" ? "text-danger" : "text-success"}`}>
            {timeLeft}
        </span>
    );
};

// --- MAIN COMPONENT ---
const AdminFlashDeals = () => {
    const [activeDeals, setActiveDeals] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [catalogPage, setCatalogPage] = useState(1);
    const itemsPerPage = 8;

    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [dealForm, setDealForm] = useState({ discount_price: '', duration: '24' });

    useEffect(() => { refreshData(); }, []);

    const refreshData = async () => {
        try {
            setLoading(true);
            const [deals, products] = await Promise.all([
                flashDealsApi.getDeals(),
                adminApi.getProducts({ page: 1, limit: 100 })
            ]);

            const dealsData = deals.data || deals || [];
            const productsData = products.data || products || [];

            setActiveDeals(Array.isArray(dealsData) ? dealsData : []);
            setAllProducts(Array.isArray(productsData) ? productsData : []);
        } catch (err) {
            console.error("Sync error:", err.response?.data || err);
        } finally { setLoading(false); }
    };

    const IMAGE_BASE_URL = "https://ngau-bazaar.onrender.com";

    // FIXED: Image Resolver handles strings OR nested arrays
    const getImageUrl = (item) => {
        if (!item) return "https://ui-avatars.com/api/?name=N+A&background=f1f5f9&color=cbd5e1";

        let path = "";
        if (item.images && item.images.length > 0) {
            path = item.images[0].url || item.images[0];
        } else {
            path = item.image_url || item.image || "";
        }

        if (!path || typeof path !== 'string') return "https://ui-avatars.com/api/?name=N+A&background=f1f5f9&color=cbd5e1";
        if (path.startsWith('http')) return path;

        const cleanPath = path.replace(/^\/+/, '');
        if (cleanPath.startsWith('static/')) {
            return `${IMAGE_BASE_URL}/${cleanPath}`;
        }
        return `${IMAGE_BASE_URL}/static/product_images/${cleanPath}`;
    };

    const filteredProducts = allProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !p.is_flash_deal
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfLastItem = catalogPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCatalogItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        setCatalogPage(1);
    }, [searchTerm]);

    const handleLaunch = async (e) => {
        // 1. Immediately stop the browser from reloading
        if (e) e.preventDefault();

        setIsActionLoading(true);

        try {
            const expiry = new Date();
            expiry.setHours(expiry.getHours() + parseInt(dealForm.duration));
            const expiryISO = expiry.toISOString();

            // 2. Perform the API call
            await flashDealsApi.updateFlashDeal(selectedProduct.id, {
                is_flash_deal: true,
                discount_price: parseFloat(dealForm.discount_price),
                deal_expiry: expiryISO
            });

            // 3. OPTIMISTIC UPDATE: Update local state instead of refreshing everything
            const launchedProduct = {
                ...selectedProduct,
                is_flash_deal: true,
                discount_price: parseFloat(dealForm.discount_price),
                deal_expiry: expiryISO
            };

            // Add to live deals
            setActiveDeals(prev => [launchedProduct, ...prev]);

            // Remove from the "Inventory Scout" list
            setAllProducts(prev => prev.filter(p => p.id !== selectedProduct.id));

            // 4. Close modal and stop loading
            setShowModal(false);
            setSelectedProduct(null);

        } catch (err) {
            console.error("Launch Error:", err);
            alert("Error: " + (err.response?.data?.detail || "Operation failed"));
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleEndSale = async (id) => {
        if (!window.confirm("End promotion for this item?")) return;
        setIsActionLoading(true);
        try {
            await flashDealsApi.removeFlashDeal(id);
            await refreshData();
        } catch (err) {
            alert("Could not end sale. Server unreachable.");
        } finally { setIsActionLoading(false); }
    };

    if (loading) return (
        <div className="retail-loader">
            <Spinner animation="border" variant="primary" size="sm" />
            <span className="ms-3 text-muted fw-semibold">Syncing Inventory...</span>
        </div>
    );

    return (
        <div className="retail-bg">
            <Container className="py-5">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <h2 className="fw-bold text-slate-900">Promotions Center</h2>
                    <Button variant="outline-secondary" className="bg-white" onClick={refreshData}>Synchronize Data</Button>
                </div>

                <Row className="g-4">
                    <Col lg={8}>
                        <div className="retail-panel">
                            <div className="panel-label">Live Campaigns</div>
                            <Table hover responsive className="align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>MSRP</th>
                                        <th>Flash</th>
                                        <th>Remaining Time</th>
                                        <th className="text-end">Management</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode='popLayout'>
                                        {activeDeals.map(deal => (
                                            <motion.tr key={deal.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="retail-img-box shadow-sm">
                                                            {/* FIXED: Passing full object to resolver */}
                                                            <img src={getImageUrl(deal)} alt={deal.name} />
                                                        </div>
                                                        <span className="ms-3 fw-bold">{deal.name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-muted small">Rs.{deal.price}</td>
                                                <td className="text-primary fw-bold">Rs.{deal.discount_price}</td>
                                                <td>
                                                    <CountdownTimer expiryDate={deal.deal_expiry} />
                                                </td>
                                                <td className="text-end">
                                                    <button
                                                        className="btn-text-danger"
                                                        onClick={() => handleEndSale(deal.id)}
                                                        disabled={isActionLoading}
                                                    >
                                                        {isActionLoading ? '...' : 'End Sale'}
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </Table>
                        </div>
                    </Col>

                    <Col lg={4}>
                        <div className="retail-panel p-4 d-flex flex-column h-100">
                            <div className="panel-label mb-3">Inventory Scout</div>
                            <InputGroup className="mb-4">
                                <Form.Control
                                    placeholder="Filter catalog..."
                                    className="bg-light border-0 py-2"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>

                            <div className="retail-scroll-area flex-grow-1">
                                {currentCatalogItems.map(p => (
                                    <div key={p.id} className="catalog-item">
                                        <div className="retail-img-box-sm">
                                            {/* FIXED: Passing full object to resolver */}
                                            <img src={getImageUrl(p)} alt={p.name} />
                                        </div>
                                        <div className="ms-3 flex-grow-1">
                                            <div className="fw-bold small">{p.name}</div>
                                            <div className="text-muted tiny">Base: Rs.{p.price}</div>
                                        </div>
                                        <Button variant="dark" size="sm" onClick={() => { setSelectedProduct(p); setShowModal(true); }}>
                                            Launch
                                        </Button>
                                    </div>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <div className="text-center py-5 text-muted small">No items found</div>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="text-dark p-0"
                                        disabled={catalogPage === 1}
                                        onClick={() => setCatalogPage(prev => prev - 1)}
                                    >
                                        Prev
                                    </Button>
                                    <span className="tiny fw-bold text-muted">Page {catalogPage} of {totalPages}</span>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="text-dark p-0"
                                        disabled={catalogPage === totalPages}
                                        onClick={() => setCatalogPage(prev => prev + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>

                <Modal show={showModal} onHide={() => setShowModal(false)} centered className="retail-modal">
                    <div className="p-4">
                        <div className="mb-4 pb-3 border-bottom">
                            <h5 className="fw-bold mb-1">Set Promo Guidelines</h5>
                            {selectedProduct && (
                                <p className="text-muted small mb-0">
                                    Deploying: <span className="text-dark fw-bold">{selectedProduct.name}</span>
                                    <span className="ms-2">(MSRP: Rs.{selectedProduct.price})</span>
                                </p>
                            )}
                        </div>

                        <Form onSubmit={handleLaunch}>
                            <Form.Group className="mb-3">
                                <Form.Label className="tiny fw-bold text-muted uppercase">Authorized Promo Price (Rs.)</Form.Label>
                                <Form.Control
                                    type="number"
                                    className="form-input-retail"
                                    required
                                    placeholder={`Enter price lower than Rs.${selectedProduct?.price}`}
                                    onChange={(e) => setDealForm({ ...dealForm, discount_price: e.target.value })}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="tiny fw-bold text-muted uppercase">Sale Duration</Form.Label>
                                <Form.Select
                                    className="form-input-retail"
                                    onChange={(e) => setDealForm({ ...dealForm, duration: e.target.value })}
                                >
                                    <option value="24">Standard (24h)</option>
                                    <option value="48">Extended (48h)</option>
                                    <option value="120">Campaign (5d)</option>
                                </Form.Select>
                            </Form.Group>

                            <Button
                                variant="dark"
                                type="submit"  // Submit triggers handleLaunch
                                className="w-100 py-3 fw-bold rounded-3"
                                disabled={isActionLoading}
                            >
                                {isActionLoading ? 'Authorizing...' : 'Authorize Flash Deal'}
                            </Button>
                        </Form>
                    </div>
                </Modal>
            </Container>
        </div>
    );
};

export default AdminFlashDeals;