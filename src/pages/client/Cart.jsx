import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Truck, MapPin } from 'lucide-react';

export default function Cart() {
  const { cartItems, removeFromCart, addToCart, decreaseQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  // --- SHIPPING LOGIC STATE ---
  const [shippingMethod, setShippingMethod] = useState('pune'); // 'pune' or 'vit'
  const [shippingCost, setShippingCost] = useState(0);

  // --- CALCULATE SHIPPING COST ---
  useEffect(() => {
    if (shippingMethod === 'vit') {
      setShippingCost(0); // Free for college pickup
    } else {
      // Pune Delivery Logic
      if (cartTotal < 500) {
        setShippingCost(79); // Under 499
      } else {
        setShippingCost(49); // 500 and above
      }
    }
  }, [cartTotal, shippingMethod]);

  const finalTotal = cartTotal + shippingCost;

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
          <p className="text-sm text-gray-500">There are <span className="font-bold text-[#7D2596]">{cartItems.length}</span> products in your cart</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-gray-100">
            <ShoppingBag size={60} className="mx-auto text-gray-200 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-[#7D2596] text-white font-bold rounded-full shadow-lg hover:bg-[#631d76] transition">Start Shopping</button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* LEFT: Cart Items */}
            <div className="lg:w-2/3 space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100 last:border-0 relative group">
                    
                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>

                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-50 rounded border border-gray-200 flex-shrink-0 flex items-center justify-center p-2">
                      <img src={item.imageUrl || item.images?.[0]} alt={item.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 w-full text-center sm:text-left">
                      <span className="text-xs text-gray-400 font-bold uppercase">{item.brand || 'Brand'}</span>
                      <h3 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h3>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-6 mt-3">
                        {/* Qty Selector */}
                        <div className="flex items-center border border-gray-200 rounded bg-gray-50">
                          <button onClick={() => decreaseQuantity(item.id)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100"><Minus size={14}/></button>
                          <span className="w-8 text-center font-bold text-sm text-gray-700">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100"><Plus size={14}/></button>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-[#7D2596]">₹{item.price * item.quantity}</span>
                          {item.oldPrice && <span className="text-sm text-gray-400 line-through">₹{item.oldPrice * item.quantity}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Cart Totals & Shipping */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
                <h3 className="font-bold text-gray-800 text-lg mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
                
                {/* --- SHIPPING OPTIONS --- */}
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-3">Choose Delivery Mode:</p>
                  
                  {/* Option 1: Standard Pune Delivery */}
                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer mb-2 transition-all ${shippingMethod === 'pune' ? 'border-[#7D2596] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                      type="radio" 
                      name="shipping" 
                      className="mt-1 accent-[#7D2596]"
                      checked={shippingMethod === 'pune'}
                      onChange={() => setShippingMethod('pune')}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm text-gray-800 flex items-center gap-2"><Truck size={14}/> Pune Delivery</span>
                        <span className="font-bold text-sm text-gray-800">
                           {cartTotal >= 500 ? '₹49' : '₹79'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Same Day Delivery available in Pune.</p>
                    </div>
                  </label>

                  {/* Option 2: VIT Pickup */}
                  <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${shippingMethod === 'vit' ? 'border-[#7D2596] bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                      type="radio" 
                      name="shipping" 
                      className="mt-1 accent-[#7D2596]"
                      checked={shippingMethod === 'vit'}
                      onChange={() => setShippingMethod('vit')}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm text-gray-800 flex items-center gap-2"><MapPin size={14}/> VIT Pickup</span>
                        <span className="font-bold text-sm text-green-600">FREE</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Pickup from VIT Bibwewadi / Kondhwa.</p>
                    </div>
                  </label>
                </div>

                {/* --- TOTALS --- */}
                <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-800">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Shipping</span>
                    <span className={`font-bold ${shippingCost === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                      {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-dashed border-gray-200">
                    <span className="text-base font-extrabold text-gray-900">Total Amount</span>
                    <span className="text-xl font-extrabold text-[#7D2596]">₹{finalTotal}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/checkout', { state: { shippingMethod, shippingCost } })}
                  className="w-full py-4 bg-[#7D2596] text-white font-bold rounded-lg shadow-lg hover:bg-[#631d76] transition-transform active:scale-[0.99] uppercase flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={18} /> Checkout
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}