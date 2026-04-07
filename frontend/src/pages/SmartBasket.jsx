import React, { useState } from 'react';
import apiClient from '../apiClient';
import { useCart } from '../context/CartContext';
import { bulkAddToCart } from '../utils/cartApi';
import './SmartBasket.css';

const SmartBasket = () => {
    const { refreshCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [params, setParams] = useState({ familySize: 4, budget: 3000 });
    const [result, setResult] = useState(null);

    const generateBasket = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/smart-basket/generate', {
                params: { family_size: params.familySize, budget: params.budget }
            });
            setResult(res);
        } catch (err) {
            alert("Could not generate basket. Try a higher budget.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddAll = async () => {
        setSyncing(true);
        try {
            const itemsToPayload = result.items.map(item => ({
                product_id: item.product_id,
                quantity: item.qty
            }))
            await bulkAddToCart(itemsToPayload);
            await refreshCart();

            alert("Success! All items added to your bag");
        } catch (err) {
            alert("Could not add all items to cart.");
        } finally {
            setSyncing(false);
        }
    };

    return (
        <div className="sb-wrapper">
            <section className="sb-hero">
                <h1>Smart Weekly Basket</h1>
                <p>AI-powered grocery planning based on your family needs.</p>
                
                <div className="sb-controls">
                    <div className="control-group">
                        <label>Family Size: <strong>{params.familySize}</strong></label>
                        <input type="range" min="1" max="10" value={params.familySize} 
                               onChange={(e) => setParams({...params, familySize: e.target.value})} />
                    </div>
                    <div className="control-group">
                        <label>Weekly Budget (रू)</label>
                        <input type="number" value={params.budget} 
                               onChange={(e) => setParams({...params, budget: e.target.value})} />
                    </div>
                    <button onClick={generateBasket} className="btn-generate" disabled={loading}>
                        {loading ? "Calculating..." : "Plan My Week"}
                    </button>
                </div>
            </section>

            {result && (
                <div className="sb-results animate-in">
                    <div className="sb-header">
                        <h3>Suggested Items ({result.items.length})</h3>
                        <p>Total: रू {result.meta.actual_total}</p>
                    </div>
                    
                    <div className="sb-grid">
                        {result.items.map(item => (
                            <div key={item.product_id} className="sb-card">
                                <img src={item.image} alt={item.name} />
                                <div className="sb-card-info">
                                    <h4>{item.name}</h4>
                                    <span>{item.qty} {item.unit} — रू {item.subtotal}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="btn-confirm-all" onClick={handleAddAll} disabled={syncing}>
                        {syncing ? "Adding..." : "Add All to My Cart"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default SmartBasket;