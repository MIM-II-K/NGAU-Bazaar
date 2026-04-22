import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// Import custom CSS
import './styles/main.css'
import ToastProvider from './contexts/ToastContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ToastProvider>
      <App />
      </ToastProvider>
    </HelmetProvider>
  </React.StrictMode>,
)