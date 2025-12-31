import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  // Helper to check if a tab is active
  const isActive = (path) => location.pathname === path;

  // Base styling for nav items
  const navItemClass = (path) => `
    flex flex-col items-center justify-center w-full h-full space-y-1
    ${isActive(path) ? 'text-[#ff4d4d]' : 'text-gray-500 hover:text-gray-900'}
    transition-colors duration-200
  `;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
      <div className="grid grid-cols-5 h-16">
        
        {/* 1. HOME */}
        <Link to="/" className={navItemClass('/')}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* 2. SEARCH */}
        <Link to="/search" className={navItemClass('/search')}>
          <Search size={22} strokeWidth={isActive('/search') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Search</span>
        </Link>

        {/* 3. WISHLIST */}
        <Link to="/wishlist" className={navItemClass('/wishlist')}>
          <Heart size={22} strokeWidth={isActive('/wishlist') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Wishlist</span>
        </Link>

        {/* 4. ORDER */}
        <Link to="/orders" className={navItemClass('/orders')}>
          <ShoppingBag size={22} strokeWidth={isActive('/orders') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Order</span>
        </Link>

        {/* 5. ACCOUNT */}
        <Link to="/account" className={navItemClass('/account')}>
          <User size={22} strokeWidth={isActive('/account') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Account</span>
        </Link>

      </div>
    </div>
  );
}