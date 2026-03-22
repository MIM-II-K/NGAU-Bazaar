// ToastMessage.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import '../styles/toastMessage.css';

const icons = {
  success: <CheckCircle2 size={20} />,
  error: <AlertCircle size={20} />,
  warning: <AlertTriangle size={20} />,
  info: <Info size={20} />,
};

const ToastMessage = ({ show, onClose, message, type = "info", duration = 4000 }) => {

  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
          className={`toast-card ${type}`}
        >
          <div className="toast-content">
            <div className={`icon-container ${type}`}>
              {icons[type]}
            </div>
            <div className="toast-text">
              {message}
            </div>
            <button className="toast-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          {/* Progress bar animation */}
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={`toast-progress ${type}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastMessage;
