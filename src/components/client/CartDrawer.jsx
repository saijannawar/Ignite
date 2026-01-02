import React, { useEffect, useRef } from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { 
    cartItems, 
    addToCart, 
    decreaseQuantity, 
    removeFromCart, 
    cartTotal, 
    cartCount, 
    isCartOpen, 
    closeCart 
  } = useCart();
  
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  // Close if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        closeCart();
      }
    }
    if (isCartOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCartOpen, closeCart]);

  return (
    // Z-index 100 ensures it is above navbar
    <div className={`fixed inset-0 z-[100] flex justify-end transition-all duration-500 ease-in-out ${
      isCartOpen ? 'bg-black/50 backdrop-blur-sm visible' : 'bg-transparent invisible pointer-events-none'
    }`}>
      
      <div 
        ref={drawerRef}
        className={`w-full max-w-sm bg-white h-[100dvh] shadow-2xl flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white z-10">
          <h2 className="font-extrabold text-gray-800 text-lg">Shopping Cart ({cartCount})</h2>
          <button 
            onClick={closeCart} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 animate-in fade-in duration-700">
              <span className="text-5xl opacity-20">🛍️</span>
              <p className="font-medium">Your cart is empty</p>
              <button onClick={closeCart} className="text-[#7D2596] font-bold text-sm hover:underline uppercase tracking-wide">
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 group animate-in slide-in-from-right-4 duration-500 fill-mode-backwards border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 flex-shrink-0 flex items-center justify-center p-2">
                  <img src={item.imageUrl || item.images?.[0] || item.img} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                </div>
                
                {/* Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mt-1">{item.brand || 'Brand'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg">
                        <button 
                            onClick={() => decreaseQuantity(item.id)}
                            className="p-1.5 hover:bg-gray-50 text-gray-500 transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold text-gray-800 w-6 text-center">{item.quantity}</span>
                        <button 
                            onClick={() => addToCart(item)}
                            className="p-1.5 hover:bg-gray-50 text-gray-500 transition-colors"
                        >
                            <Plus size={12} />
                        </button>
                    </div>

                    <span className="font-bold text-[#7D2596]">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50/80 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4 text-sm">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="font-bold text-gray-800 text-lg">₹{cartTotal.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1">
              <button 
                onClick={() => { closeCart(); navigate('/cart'); }}
                className="bg-[#7D2596] text-white py-3.5 rounded-xl font-bold text-xs uppercase hover:bg-[#631d76] transition-all shadow-lg shadow-purple-200"
              >
                View Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}