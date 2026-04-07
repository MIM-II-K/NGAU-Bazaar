import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Wallet, ShoppingBag, ChevronRight, CheckCircle2 } from 'lucide-react';
import apiClient from '../utils/api';
import { useCart } from "../contexts/CartContext";
import { bulkAddToCart } from '../utils/cartApi';
import '../styles/SmartBasket.css';

const SmartBasket = () => {
    const { refreshCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [params, setParams] = useState({ familySize: 4, budget: 3000 });
    const [result, setResult] = useState(null);

    const generateBasket = async () => {
        setLoading(true);
        setResult(null); // Force reset to trigger re-animations and clear old state
        try {
            const res = await apiClient.get('/smart-basket/generate', {
                params: { 
                    family_size: parseInt(params.familySize), 
                    budget: parseInt(params.budget) 
                }
            });

            // If backend returns success but 0 items (budget too low)
            if (res.data && res.data.items.length === 0) {
                alert("We couldn't find enough items within this budget. Please try a higher amount.");
            } else {
                setResult(res.data);
            }
        } catch (err) {
            console.error("Generation error:", err.response?.data || err.message);
            alert("Could not generate basket. Please ensure your categories are set up correctly in the database.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAll = async () => {
        // Guard clause to ensure result and items exist
        if (!result || !result.items || result.items.length === 0) return;

        setSyncing(true);
        try {
            const payload = result.items.map(item => ({
                product_id: item.product_id,
                quantity: item.qty
            }));

            // Sync with your bulk API
            await bulkAddToCart(payload);
            
            // Critical: Refresh context so the Cart Page updates immediately
            if (refreshCart) await refreshCart();

            setResult(null); 
            alert("🛒 Success! Your weekly basket is ready in the cart.");
        } catch (err) {
            console.error("Sync error:", err.response?.data || err.message);
            alert("Failed to sync basket to cart. Are you logged in?");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="sb-container">
            <div className="glow-orb orb-1"></div>
            <div className="glow-orb orb-2"></div>

            <header className="sb-hero-section">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sb-badge"
                >
                    <Sparkles size={14} /> AI Powered Planning
                </motion.div>
                <h1>Smart Weekly <span>Basket</span></h1>
                <p>Sustainable Palpa produce, intelligently planned for your home.</p>
            </header>

            <section className="sb-config-card">
                <div className="sb-input-grid">
                    <div className="input-box">
                        <label><Users size={18} /> Family Size</label>
                        <div className="range-wrapper">
                            <input 
                                type="range" min="1" max="10" 
                                value={params.familySize} 
                                onChange={(e) => setParams({...params, familySize: e.target.value})} 
                            />
                            <span className="count-display">{params.familySize} Members</span>
                        </div>
                    </div>

                    <div className="input-box">
                        <label><Wallet size={18} /> Weekly Budget (रू)</label>
                        <input 
                            type="number" 
                            className="modern-number-input"
                            value={params.budget} 
                            onChange={(e) => setParams({...params, budget: e.target.value})} 
                        />
                    </div>
                </div>

                <button 
                    onClick={generateBasket} 
                    className={`btn-ai-generate ${loading ? 'loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? "Analyzing NGAU Inventory..." : "Generate Smart Plan"}
                    <ChevronRight size={20} />
                </button>
            </section>

            <AnimatePresence>
                {result && result.items && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="sb-results-wrapper"
                    >
                        <div className="results-header">
                            <div className="total-meta">
                                <h3>Your Weekly Essentials</h3>
                                <span>Estimated Total: <strong>रू {result.meta.actual_total}</strong></span>
                            </div>
                            <button 
                                className="btn-bulk-add" 
                                onClick={handleAddAll} 
                                disabled={syncing}
                            >
                                {syncing ? "Syncing..." : <>Add All to Cart <ShoppingBag size={18} /></>}
                            </button>
                        </div>

                        <div className="sb-product-grid">
                            {result.items.map((item, index) => (
                                <motion.div 
                                    key={item.product_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="product-glass-card"
                                >
                                    <div className="img-container">
                                        <img src={item.image || '/placeholder-food.png'} alt={item.name} />
                                        <div className="qty-tag">{item.qty} {item.unit}</div>
                                    </div>
                                    <div className="card-details">
                                        <h4>{item.name}</h4>
                                        <div className="price-row">
                                            <span className="subtotal">रू {item.subtotal}</span>
                                            <CheckCircle2 size={16} className="status-icon" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SmartBasket;