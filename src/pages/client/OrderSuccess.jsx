import React from 'react';
import { Link } from 'react-router-dom';
import { Check, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function OrderSuccess() {
  const { currentUser } = useAuth();

  return (
    // Updated background to #f3e5f5 to match other pages
    <div className="bg-[#f3e5f5] min-h-screen flex items-center justify-center font-sans px-4">
      <div className="w-full max-w-3xl text-center">
        
        {/* Animated Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Background shape mimicking the scallop badge */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce-slow">
               <BadgeCheck size={80} className="text-green-500" fill="currentColor" stroke="white" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your order is placed</h1>
        <p className="text-gray-500 mb-1">Thank you for your order.</p>
        <p className="text-gray-500 mb-8">
          Order Invoice sent to your email <span className="font-bold text-gray-800">{currentUser?.email || 'your-email@example.com'}</span>
        </p>

        {/* Back Home Button - Updated to #7b1fa2 */}
        <Link 
          to="/" 
          className="inline-block px-8 py-3 bg-white border border-[#7b1fa2] text-[#7b1fa2] font-bold text-sm rounded hover:bg-[#7b1fa2] hover:text-white transition-all uppercase tracking-wide shadow-sm"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
}