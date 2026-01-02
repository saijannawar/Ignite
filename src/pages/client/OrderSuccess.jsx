import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Lottie from "lottie-react";

// ✅ Import the local JSON file you downloaded
import successAnim from '../../assets/success.json'; 

export default function OrderSuccess() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 p-4 font-sans text-center">
      
      {/* Animation Card */}
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 transform transition-all hover:scale-[1.01]">
        
        <div className="flex justify-center mb-6">
          <div className="w-40 h-40">
            {/* ✅ Pass the imported file directly here */}
            <Lottie animationData={successAnim} loop={false} /> 
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-8">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>

        <div className="space-y-3">
          <Link 
            to="/orders" 
            className="block w-full py-3.5 bg-[#7D2596] text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:bg-[#631d76] transition-all"
          >
            Track Order
          </Link>
          
          <Link 
            to="/" 
            className="block w-full py-3.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
        </div>

      </div>

      <div className="mt-8 text-xs text-gray-400">
        Need help? <a href="https://wa.me/919011401920" target="_blank" rel="noreferrer" className="text-[#7D2596] hover:underline">Contact Support</a>
      </div>

    </div>
  );
}