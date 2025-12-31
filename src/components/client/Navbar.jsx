import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, Heart, Menu, User, LogOut, Grid, MapPin, ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext'; // Import Cart Context
import { auth } from '../../config/firebase'; 
import { getCategories } from '../../services/categoryService';
import CartDrawer from '../../components/client/CartDrawer'; // Import Drawer

export default function Navbar({ onOpenSidebar }) {
  const { currentUser } = useAuth();
  
  // ✅ Get cartCount AND openCart/closeCart from context
  // Also getting isCartOpen if you want to control it here, but Drawer uses context directly
  const { cartCount, openCart, closeCart, isCartOpen } = useCart(); 
  
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load nav categories", error);
      }
    };
    fetchCats();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <>
      <header className="bg-white sticky top-0 z-40 shadow-sm font-sans">
        
        {/* --- TOP BAR --- */}
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 border-b border-gray-100">
          
          {/* 1. LEFT: Mobile Menu & Logo */}
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-700 p-1 hover:bg-gray-100 rounded" onClick={onOpenSidebar}>
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-[#ff4d4d] text-white p-2 rounded-lg group-hover:bg-red-600 transition-colors">
                 <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                 <span className="text-xl font-extrabold tracking-tight text-gray-800 leading-none">
                   CLASSY<span className="text-[#ff4d4d]">SHOP</span>
                 </span>
                 <span className="text-[10px] text-gray-400 font-bold tracking-[0.15em] uppercase hidden sm:block">
                   Big Mega Store
                 </span>
              </div>
            </Link>
          </div>

          {/* 2. CENTER: Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <input 
              type="text" 
              placeholder="Search for products..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 pl-11 focus:border-[#ff4d4d] focus:bg-white focus:ring-1 focus:ring-red-100 outline-none transition-all text-sm text-gray-700 placeholder-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          {/* 3. RIGHT: User Actions */}
          <div className="flex items-center gap-6">
            
            {/* USER PROFILE SECTION */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                {/* Profile Trigger */}
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="hidden md:flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1.5 pr-3 rounded-lg transition-colors select-none"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border border-gray-200 overflow-hidden">
                     {currentUser.photoURL ? (
                       <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                     ) : (
                       <User className="w-5 h-5" />
                     )}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-gray-800 leading-tight">
                      {currentUser.displayName || "User"}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {currentUser.email || "No Email"}
                    </span>
                  </div>
                </div>

                {/* Mobile Profile Icon */}
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="md:hidden w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"
                >
                   <User className="w-5 h-5" />
                </button>

                {/* DROPDOWN MENU */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="absolute -top-[6px] right-6 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>

                    <Link to="/account" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#ff4d4d] transition-colors">
                      <User className="w-4 h-4" /> My Account
                    </Link>
                    <Link to="/address" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#ff4d4d] transition-colors">
                      <MapPin className="w-4 h-4" /> Address
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#ff4d4d] transition-colors">
                      <ShoppingBag className="w-4 h-4" /> Orders
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#ff4d4d] transition-colors">
                      <Heart className="w-4 h-4" /> My List
                    </Link>
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#ff4d4d] text-left transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-[#ff4d4d]">Login</Link>
            )}

            {/* Wishlist Icon */}
            <Link to="/wishlist" className="hidden md:block text-gray-500 hover:text-[#ff4d4d] transition-colors">
              <Heart className="w-6 h-6" />
            </Link>

            {/* Cart Icon -> Opens Drawer via Context */}
            <button 
              onClick={openCart} 
              className="relative text-gray-500 hover:text-[#ff4d4d] transition-colors pr-1 outline-none"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-[#ff4d4d] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* --- BOTTOM BAR (Categories) --- */}
        <div className="hidden md:block border-b border-gray-100 bg-white">
          <div className="container mx-auto px-4">
             <nav className="flex items-center justify-between h-12">
               <button onClick={onOpenSidebar} className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors">
                  <Grid className="w-3.5 h-3.5" /> SHOP BY CATEGORIES
               </button>

               <div className="flex gap-8 text-[13px] font-semibold text-gray-500 tracking-wide">
                  <Link to="/" className="hover:text-[#ff4d4d] transition-colors uppercase">Home</Link>
                  {categories.slice(0, 5).map((cat) => (
                    <Link key={cat.id} to={`/shop?category=${cat.id}`} className="hover:text-[#ff4d4d] transition-colors uppercase">
                      {cat.name}
                    </Link>
                  ))}
               </div>

               <div className="text-gray-400 text-xs font-medium">
                 Free International Delivery
               </div>
             </nav>
          </div>
        </div>
      </header>

      {/* ✅ Render Cart Drawer (Controlled via Context now) */}
      <CartDrawer />
    </>
  );
}