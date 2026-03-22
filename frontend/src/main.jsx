import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// Import custom CSS
import './styles/main.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)