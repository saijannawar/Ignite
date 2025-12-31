import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// ✅ IMPORTANT: This line MUST be here for Tailwind to work
import './index.css' 

// Import your Providers
import { AuthProvider } from './context/AuthContext' // If you wrap auth here
import { CartProvider } from './context/CartContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Ensure Providers are wrapping the App */}
    <CartProvider> 
        <App />
    </CartProvider>
  </React.StrictMode>,
)