import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext'; // <--- Use Cart Context
import { addToWishlist } from '../../services/productService';

export default function ClientProductCard({ product }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // ✅ 1. Get openCart from context
  const { cartItems, addToCart, decreaseQuantity, openCart } = useCart(); 
  
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  // Check if product is already in cart
  const cartItem = cartItems.find(item => item.id === (product.id || product.productId));
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleNavigate = () => {
    navigate(`/product/${product.id || product.productId}`);
    window.scrollTo(0, 0);
  };

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      alert("Please login to add items to your wishlist.");
      return;
    }
    try {
      setAddingToWishlist(true);
      await addToWishlist(currentUser.uid, {
        id: product.id || product.productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl || (product.images && product.images[0]) || '',
      });
      alert("Added to Wishlist!");
    } catch (error) {
      console.error(error);
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // ✅ 2. Add item AND trigger the sidebar animation
    addToCart(product);
    openCart(); 
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    decreaseQuantity(product.id || product.productId);
  };

  const displayImage = product.images?.[0] || product.imageUrl || "https://via.placeholder.com/300";
  const ratingValue = product.rating || 0;

  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 font-sans w-full h-[380px] sm:h-[460px] flex flex-col">
      
      {/* 1. Image Section */}
      <div onClick={handleNavigate} className="relative h-[65%] w-full bg-gray-50 overflow-hidden cursor-pointer">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700 ease-in-out mix-blend-multiply"
        />
        
        {/* Overlay Icons (Wishlist/Preview) */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button onClick={handleWishlistClick} disabled={addingToWishlist} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-[#ff4d4d] hover:bg-red-50 transition-colors">
            <Heart size={18} className={addingToWishlist ? 'animate-pulse text-[#ff4d4d]' : ''} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleNavigate(); }} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-colors delay-75">
            <Eye size={18} />
          </button>
        </div>

        {/* --- ADD TO CART / QUANTITY SELECTOR --- */}
        {/* This slides up on hover */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/90 via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
        
        {/* ✅ Added transition-transform for smooth slide up */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-500 ease-out z-20 
          ${quantity > 0 ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}
        >
           {quantity > 0 ? (
             // --- QUANTITY SELECTOR (If in cart) ---
             // ✅ Added animate-in zoom-in for smooth appearance
             <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full shadow-lg h-[42px] px-1 w-full max-w-[180px] mx-auto animate-in zoom-in duration-200">
               <button 
                 onClick={handleDecrease}
                 className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors active:scale-90"
               >
                 <Minus size={14} strokeWidth={3} />
               </button>
               
               <span className="font-bold text-gray-800 text-sm w-8 text-center">{quantity}</span>
               
               <button 
                 onClick={handleAddToCart} // Clicking + also opens drawer now
                 className="w-8 h-8 flex items-center justify-center bg-[#2c3e50] rounded-full text-white hover:bg-black transition-colors active:scale-90"
               >
                 <Plus size={14} strokeWidth={3} />
               </button>
             </div>
           ) : (
             // --- ADD TO CART BUTTON (If not in cart) ---
             <button 
               onClick={handleAddToCart} 
               disabled={product.stock <= 0}
               // ✅ Added active:scale-95 for button press effect
               className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95
                 ${product.stock <= 0 ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#ff4d4d] hover:bg-red-600 text-white shadow-red-200/50'}`}
             >
               {product.stock <= 0 ? "Out of Stock" : <><ShoppingCart size={16} /> Add To Cart</>}
             </button>
           )}
        </div>
      </div>

      {/* 2. Content Section */}
      <div className="h-[35%] p-5 text-center bg-white relative z-30 flex flex-col justify-between">
         <div>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{product.brand || 'Brand'}</p>
           <div className="h-10 flex items-center justify-center overflow-hidden">
             <h3 onClick={handleNavigate} className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 hover:text-[#ff4d4d] cursor-pointer transition-colors">
               {product.name}
             </h3>
           </div>
         </div>

         <div className="flex justify-center items-center gap-1 my-1 text-yellow-400">
           {[...Array(5)].map((_, i) => (
             <Star key={i} size={12} fill={i < ratingValue ? "currentColor" : "none"} strokeWidth={i < ratingValue ? 0 : 1.5} className={i >= ratingValue ? "text-gray-300" : ""} />
           ))}
           <span className="text-[10px] text-gray-400 font-medium ml-1">({product.reviews?.length || 0})</span>
         </div>

         <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-50">
            {product.oldPrice > product.price && <span className="text-xs text-gray-400 line-through font-medium decoration-gray-300">₹{product.oldPrice}</span>}
            <span className="text-lg font-extrabold text-[#ff4d4d]">₹{product.price}</span>
         </div>
      </div>
    </div>
  );
}