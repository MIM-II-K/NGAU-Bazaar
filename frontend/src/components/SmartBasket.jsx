import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Users, Wallet, ShoppingBag, ChevronRight, CheckCircle2, 
  RefreshCw, Home, Building2, TrendingUp, Package, Leaf
} from 'lucide-react';
import apiClient from '../utils/api';
import { useCart } from "../contexts/CartContext";
import { bulkAddToCart } from '../utils/cartApi';
import '../styles/SmartBasket.css';

const SmartBasket = () => {
  const { refreshCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [basketMode, setBasketMode] = useState('daily'); // 'daily' or 'bulk'
  const [params, setParams] = useState({ familySize: 4, budget: 3000 });
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  // Update params when mode changes
  useEffect(() => {
    if (basketMode === 'daily') {
      setParams({ familySize: 4, budget: 3000 });
    } else {
      setParams({ familySize: 8, budget: 10000 });
    }
  }, [basketMode]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const generateBasket = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await apiClient.get('/smart-basket/generate', {
        params: {
          family_size: parseInt(params.familySize),
          budget: parseInt(params.budget)
        }
      });

      if (!res?.items || res.items.length === 0) {
        showToast('No suitable products found for this budget. Try increasing budget or changing family size.', 'error');
        return;
      }

      setResult(res);
      showToast(`✨ Smart basket generated! ${res.items.length} items added.`, 'success');
    } catch (err) {
      console.error("Generation error:", err);
      showToast(err.message || 'Could not generate basket. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = async () => {
    if (!result?.items?.length) return;

    setSyncing(true);
    try {
      const payload = result.items.map(item => ({
        product_id: item.product_id,
        quantity: item.qty || 1
      }));

      await bulkAddToCart(payload);
      await refreshCart();
      window.dispatchEvent(new Event('cartUpdated'));
      setResult(null);
      showToast(`🛒 ${payload.length} items added to your cart!`, 'success');
    } catch (err) {
      console.error("Sync error:", err);
      showToast(err.message || 'Failed to add items to cart.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Dynamic AI insight text
  const getAIInsight = () => {
    if (!result) return null;
    const itemsCount = result.items.length;
    const total = result.meta.actual_total;
    const saved = params.budget - total;
    return {
      title: basketMode === 'daily' ? 'Your Daily Essentials' : 'Bulk Saver Plan',
      description: `We've curated ${itemsCount} items for ${params.familySize} members. ` +
        (saved > 0 ? `You saved रू${saved} compared to market prices! ` : '') +
        `All produce sourced directly from Palpa farms.`,
      icon: basketMode === 'daily' ? <Home size={24} /> : <Building2 size={24} />
    };
  };

  const insight = getAIInsight();

  return (
    <div className="sb-container">
      {/* Animated background orbs */}
      <div className="glow-orb orb-1"></div>
      <div className="glow-orb orb-2"></div>
      <div className="glow-orb orb-3"></div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`sb-toast ${toast.type}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
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

      {/* Mode Toggle */}
      <div className="mode-toggle">
        <button
          className={`mode-btn ${basketMode === 'daily' ? 'active' : ''}`}
          onClick={() => setBasketMode('daily')}
        >
          <Home size={18} /> Daily Essentials
        </button>
        <button
          className={`mode-btn ${basketMode === 'bulk' ? 'active' : ''}`}
          onClick={() => setBasketMode('bulk')}
        >
          <Building2 size={18} /> Bulk Saver (10% off)
        </button>
      </div>

      {/* Configuration Card */}
      <section className="sb-config-card">
        <div className="sb-input-grid">
          <div className="input-box">
            <label><Users size={18} /> Family Size</label>
            <div className="range-wrapper">
              <input
                type="range"
                min="1"
                max={basketMode === 'daily' ? "10" : "50"}
                value={params.familySize}
                onChange={(e) => setParams({ ...params, familySize: parseInt(e.target.value) })}
              />
              <span className="count-display">{params.familySize} {params.familySize === 1 ? 'Member' : 'Members'}</span>
            </div>
          </div>

          <div className="input-box">
            <label><Wallet size={18} /> Weekly Budget (रू)</label>
            <input
              type="number"
              className="modern-number-input"
              value={params.budget}
              onChange={(e) => setParams({ ...params, budget: parseInt(e.target.value) })}
              step={basketMode === 'daily' ? 500 : 2000}
            />
          </div>
        </div>

        <motion.button
          onClick={generateBasket}
          className={`btn-ai-generate ${loading ? 'loading' : ''}`}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <RefreshCw size={18} className="spin" /> Analyzing NGAU Inventory...
            </>
          ) : (
            <>
              Generate Smart Plan <ChevronRight size={20} />
            </>
          )}
        </motion.button>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {result && result.items && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="sb-results-wrapper"
          >
            {/* AI Insight Panel */}
            {insight && (
              <div className="ai-insight-panel">
                <div className="insight-icon">{insight.icon}</div>
                <div className="insight-content">
                  <h3>{insight.title}</h3>
                  <p>{insight.description}</p>
                </div>
                <div className="insight-badge">
                  <Leaf size={16} /> Farm Fresh
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="results-header">
              <div className="total-meta">
                <h3>Your Weekly Essentials</h3>
                <span>Estimated Total: <strong>रू {result.meta.actual_total}</strong></span>
              </div>
              <motion.button
                className="btn-bulk-add"
                onClick={handleAddAll}
                disabled={syncing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {syncing ? (
                  <>Adding... <RefreshCw size={16} className="spin" /></>
                ) : (
                  <>Add All to Cart <ShoppingBag size={18} /></>
                )}
              </motion.button>
            </div>

            {/* Product Grid (responsive: grid → horizontal scroll on mobile) */}
            <div className="sb-product-grid">
              {result.items.map((item, index) => (
                <motion.div
                  key={item.product_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="product-glass-card"
                  whileHover={{ y: -5 }}
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

      {/* Empty state with suggestion */}
      {!result && !loading && (
        <div className="sb-empty-state">
          <Package size={48} className="empty-icon" />
          <h4>No basket generated yet</h4>
          <p>Adjust your family size and budget, then click "Generate Smart Plan".</p>
        </div>
      )}
    </div>
  );
};

export default SmartBasket;