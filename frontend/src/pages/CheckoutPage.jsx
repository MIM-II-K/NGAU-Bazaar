import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiClient from "../utils/api";
import { getCart, checkoutCart } from "../utils/cartApi";
import { getProductImageUrl } from "../utils/urlHelper"; // Added Import
import "../styles/CheckoutPage.css";

const API_BASE_URL = "https://ngau-bazaar.onrender.com";

const NEPAL_DATA = {
  "Koshi": ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"],
  "Madhesh": ["Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"],
  "Bagmati": ["Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok"],
  "Gandaki": ["Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur", "Parbat", "Syangja", "Tanahu"],
  "Lumbini": ["Arghakhanchi", "Banke", "Bardiya", "Dang", "Gulmi", "Kapilvastu", "Parasi", "Palpa", "Pyuthan", "Rolpa", "Rukum East", "Rupandehi"],
  "Karnali": ["Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Rukum West", "Salyan", "Surkhet"],
  "Sudurpashchim": ["Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"]
};

const CheckoutPage = () => {
  const [cart, setCart] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    full_name: "", phone: "", email: "", province: "", district: "", address: "", postal_code: "", notes: ""
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await getCart();
      setCart(res);
    } catch (err) {
      console.error("Failed to load cart", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleProvinceChange = (e) => {
    const province = e.target.value;
    setFormData(prev => ({ ...prev, province, district: "" }));
    if (errors.province) setErrors(prev => ({ ...prev, province: null }));
  };

  const validate = () => {
    let newErrors = {};
    const required = ["full_name", "phone", "email", "province", "district", "address"];
    required.forEach(field => {
      if (!formData[field]?.trim()) newErrors[field] = `${field.replace("_", " ")} is required`;
    });
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validate()) return;
    setProcessing(true);
    try {
      const checkout = await checkoutCart({ ...formData, payment_method: "esewa" });
      const orderId = checkout?.order_id;
      
      if (!orderId) throw new Error("Order creation failed.");

      const esewaConfig = await apiClient.post(`/payments/esewa/initiate/${orderId}`);
      
      const form = document.createElement("form");
      form.method = "POST";
      form.action = esewaConfig.action;

      Object.entries(esewaConfig.fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      alert(err.message || "An unexpected error occurred.");
      setProcessing(false);
    }
  };

  if (!cart) return <div className="glass-loader-container"><div className="spinner"></div></div>;

  const subtotal = cart.items?.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0) || 0;
  const tax = subtotal * 0.13;
  const delivery = 100;
  const total = subtotal + tax + delivery;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="checkout-page-wrapper"
    >
      <div className="glass-card">
        {/* Left Side: Shipping Form */}
        <div className="shipping-pane">
          <h2 className="pane-header">Shipping Information</h2>
          <div className="modern-form-grid">
            <div className={`input-box wide ${errors.full_name ? "invalid" : ""}`}>
              <label>Full Name *</label>
              <input name="full_name" placeholder="John Doe" onChange={handleInputChange} />
              {errors.full_name && <span className="error-text">{errors.full_name}</span>}
            </div>

            <div className={`input-box ${errors.email ? "invalid" : ""}`}>
              <label>Email Address *</label>
              <input name="email" type="email" placeholder="john@example.com" onChange={handleInputChange} />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className={`input-box ${errors.phone ? "invalid" : ""}`}>
              <label>Phone Number *</label>
              <input name="phone" placeholder="98XXXXXXXX" onChange={handleInputChange} />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className={`input-box ${errors.province ? "invalid" : ""}`}>
              <label>Province *</label>
              <select name="province" value={formData.province} onChange={handleProvinceChange}>
                <option value="">Select Province</option>
                {Object.keys(NEPAL_DATA).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.province && <span className="error-text">{errors.province}</span>}
            </div>

            <div className={`input-box ${errors.district ? "invalid" : ""}`}>
              <label>District *</label>
              <select 
                name="district" 
                value={formData.district} 
                onChange={handleInputChange}
                disabled={!formData.province}
              >
                <option value="">Select District</option>
                {formData.province && NEPAL_DATA[formData.province].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.district && <span className="error-text">{errors.district}</span>}
            </div>

            <div className={`input-box wide ${errors.address ? "invalid" : ""}`}>
              <label>Street Address *</label>
              <input name="address" placeholder="House No, Street Name" onChange={handleInputChange} />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="input-box">
              <label>Postal Code</label>
              <input name="postal_code" placeholder="44600" onChange={handleInputChange} />
            </div>

            <div className="input-box wide">
              <label>Order Notes</label>
              <textarea name="notes" placeholder="Notes about your delivery..." onChange={handleInputChange} />
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="order-summary-pane">
          <h2 className="pane-header">Review Order</h2>
          <div className="items-list">
            <AnimatePresence>
              {cart.items.map((item, idx) => {
                // Resolved the image path using the helper to match Cart and Detail logic
                const finalImageUrl = getProductImageUrl(item.image_url || item.product?.images?.[0]?.url, API_BASE_URL);
                
                return (
                  <motion.div 
                    key={item.product_id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="mini-item-card"
                  >
                    <img 
                      src={finalImageUrl} 
                      alt={item.product_name} 
                      className="mini-thumb" 
                      onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }}
                    />
                    <div className="mini-details">
                      <p className="mini-name">{item.product_name}</p>
                      <p className="mini-qty">Qty: {item.quantity}</p>
                    </div>
                    <p className="mini-price">Rs. {Number(item.price * item.quantity).toFixed(2)}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="calculation-box">
            <div className="calc-row"><span>Subtotal</span><span>Rs. {subtotal.toFixed(2)}</span></div>
            <div className="calc-row"><span>VAT (13%)</span><span>Rs. {tax.toFixed(2)}</span></div>
            <div className="calc-row"><span>Delivery</span><span>Rs. {delivery.toFixed(2)}</span></div>
            <div className="calc-row grand-total"><span>Total</span><span>Rs. {total.toFixed(2)}</span></div>
          </div>

          <button 
            className={`esewa-pay-button ${processing ? 'is-loading' : ''}`} 
            onClick={handlePayment} 
            disabled={processing || cart.items.length === 0}
          >
            {processing ? "" : "Pay with eSewa"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutPage;