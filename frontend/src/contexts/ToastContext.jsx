import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiInfo, 
  FiX, 
  FiAlertTriangle 
} from 'react-icons/fi';

import '../styles/toast.css';

const ToastContext = createContext();

const ToastIcons = {
  success: <FiCheckCircle size={20} />,
  error: <FiAlertCircle size={20} />,
  info: <FiInfo size={20} />,
  warning: <FiAlertTriangle size={20} />
};

const ToastColors = {
  success: '#10b981',
  error: '#ef4444',
  info: '#3b82f6',
  warning: '#f59e0b'
};

const Toast = ({ id, message, type, onClose }) => {
  const [isHovered, setIsHovered] = useState(false);

  React.useEffect(() => {
    if (!isHovered) {
      const timer = setTimeout(() => {
        onClose(id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isHovered, id, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="toast-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ backgroundColor: ToastColors[type] }}
    >
      <div className="toast-icon">
        {ToastIcons[type]}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => onClose(id)}>
        <FiX size={16} />
      </button>
      <motion.div 
        className="toast-progress"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 3, ease: 'linear' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </motion.div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  }, []);

  const success = useCallback((message) => addToast(message, 'success'), [addToast]);
  const error = useCallback((message) => addToast(message, 'error'), [addToast]);
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
      {children}
      <div className="toast-container">
        <AnimatePresence mode="sync">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              id={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export default ToastProvider;