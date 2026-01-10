import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ✅ IMPORTANT: This line MUST be here for Tailwind to work
import './index.css' 

// Import your Providers
import { AuthProvider } from './context/AuthContext' // If you wrap auth here
import { CartProvider } from './context/CartContext'
import { HelmetProvider } from 'react-helmet-async' // ✅ Import SEO Provider

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider> {/* ✅ Wrap everything for SEO */}
      <CartProvider> 
          <App />
      </CartProvider>
    </HelmetProvider>
  </React.StrictMode>,
)