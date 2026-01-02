import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom'; // ✅ Added useLocation
import { MapPin, CreditCard, Trash2, Loader, Building, Info } from 'lucide-react'; 
import { 
  getUserAddresses, 
  addUserAddress, 
  deleteUserAddress, 
  updateUserAddress 
} from '../../services/productService'; 

import { db } from '../../config/firebase'; 
import { 
  collection, 
  doc, 
  writeBatch, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 1. GET SHIPPING INFO FROM CART PAGE
  // Default to 'pune' if accessed directly without state
  const { shippingMethod, shippingCost } = location.state || { shippingMethod: 'pune', shippingCost: 0 };
  
  // Calculate Final Total
  const finalTotal = cartTotal + shippingCost;

  // State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false); 
  
  // Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);
  
  const [newAddress, setNewAddress] = useState({
    line1: '', city: '', state: '', pincode: '', country: '', phone: '', type: 'Home'
  });

  // Fetch Addresses (Only needed if shipping method is Pune)
  useEffect(() => {
    const fetchAddresses = async () => {
      if (currentUser) {
        try {
          const data = await getUserAddresses(currentUser.uid);
          setAddresses(data);
          if (data.length > 0) setSelectedAddressId(data[0].id);
        } catch (error) {
          console.error("Error fetching addresses", error);
        } finally {
          setLoading(false);
        }
      }
    };
    if (shippingMethod === 'pune') {
        fetchAddresses();
    } else {
        setLoading(false); // Stop loading if VIT pickup
    }
  }, [currentUser, shippingMethod]);

  // Handlers for Add/Edit/Delete
  const handleOpenAdd = () => {
    setNewAddress({ line1: '', city: '', state: '', pincode: '', country: '', phone: '', type: 'Home' });
    setIsEditing(false);
    setEditId(null);
    setShowAddressModal(true);
  };

  const handleOpenEdit = (addr) => {
    setNewAddress(addr);
    setIsEditing(true);
    setEditId(addr.id);
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode || !newAddress.country || !newAddress.phone) return alert("Fill all fields");
    if (newAddress.phone.length !== 10) return alert("Invalid phone");

    try {
      setSavingAddress(true);
      if (isEditing) {
        await updateUserAddress(currentUser.uid, editId, newAddress);
        setAddresses(addresses.map(a => a.id === editId ? { ...newAddress, id: editId } : a));
      } else {
        const savedAddr = await addUserAddress(currentUser.uid, newAddress);
        setAddresses([...addresses, savedAddr]);
        setSelectedAddressId(savedAddr.id);
      }
      setShowAddressModal(false);
    } catch (error) {
      alert("Error saving address");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete?")) {
      await deleteUserAddress(currentUser.uid, id);
      setAddresses(addresses.filter(a => a.id !== id));
      if (selectedAddressId === id) setSelectedAddressId(null);
    }
  };

  // ✅ UPDATED PLACE ORDER LOGIC
  const handlePlaceOrder = async () => {
    // Validation: Only check address if shipping is 'pune'
    if (shippingMethod === 'pune' && !selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }
    
    if (!currentUser) return;
    if (cartItems.length === 0) return alert("Your cart is empty!");

    try {
      setProcessingOrder(true);
      
      // Determine final address object
      let finalAddress = {};
      
      if (shippingMethod === 'vit') {
          // Hardcoded address for VIT Pickup
          finalAddress = {
              line1: 'VIT College Campus (Bibwewadi/Kondhwa)',
              city: 'Pune',
              state: 'MH',
              pincode: '411037',
              country: 'India',
              phone: currentUser.phoneNumber || 'N/A', // Use login phone or N/A
              type: 'Pickup'
          };
      } else {
          // Selected User Address
          finalAddress = addresses.find(addr => addr.id === selectedAddressId);
      }
      
      const batch = writeBatch(db);

      // 1. CHECK STOCK
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
           throw new Error(`Product "${item.name}" no longer exists.`);
        }

        const currentStock = Number(productSnap.data().stock) || 0;
        
        if (currentStock < item.quantity) {
          alert(`Insufficient stock for "${item.name}". Only ${currentStock} left.`);
          setProcessingOrder(false);
          return; 
        }
      }

      // 2. CREATE ORDER
      const orderRef = doc(collection(db, 'orders'));
      const orderData = {
        orderId: orderRef.id,
        userId: currentUser.uid,
        customerName: currentUser.displayName || 'User',
        email: currentUser.email,
        items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.imageUrl || item.images?.[0] || ''
        })),
        subtotal: cartTotal,
        shippingCost: shippingCost,
        total: finalTotal, // ✅ Saves the final total including shipping
        shippingMethod: shippingMethod, // 'vit' or 'pune'
        address: finalAddress,
        status: 'Processing',
        paymentMethod: 'Cash On Delivery', // or 'Pay on Pickup' if VIT
        date: new Date().toLocaleDateString('en-GB'),
        createdAt: serverTimestamp(),
      };

      batch.set(orderRef, orderData);

      // 3. DECREASE STOCK
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        const currentStock = Number(productSnap.data().stock) || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        batch.update(productRef, { stock: newStock });
      }

      await batch.commit();
      
      clearCart();
      navigate('/order-success');

    } catch (error) {
      console.error("Order failed", error);
      alert("Failed to place order. " + error.message);
    } finally {
      setProcessingOrder(false);
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: Delivery Details Section */}
          <div className="lg:w-2/3">
             <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[400px]">
                
                {/* ✅ CONDITIONAL RENDER: Address vs Pickup Info */}
                {shippingMethod === 'vit' ? (
                    // --- OPTION A: VIT PICKUP UI ---
                    <div>
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                            <Building className="text-[#7D2596]" size={24} />
                            <h2 className="text-lg font-bold text-gray-800">College Pickup</h2>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                            <h3 className="text-green-800 font-bold text-lg mb-2">Free Delivery Applied!</h3>
                            <p className="text-green-700 mb-4">
                                You have selected to pick up your order from <strong>VIT College Campus</strong>.
                            </p>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>📍 <strong>Location:</strong> Bibwewadi / Kondhwa Campus</p>
                                <p>⏰ <strong>Timing:</strong> We will contact you for pickup time.</p>
                                <p>💰 <strong>Payment:</strong> Cash on Pickup available.</p>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded">
                            <Info size={16} />
                            <span>No need to add an address. We will verify via student ID at pickup.</span>
                        </div>
                    </div>
                ) : (
                    // --- OPTION B: PUNE DELIVERY ADDRESS UI ---
                    <>
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                           <h2 className="text-lg font-bold text-gray-800">Select Delivery Address</h2>
                           <button onClick={handleOpenAdd} className="text-[#7D2596] text-xs font-bold uppercase border border-[#7D2596] px-4 py-2 rounded hover:bg-[#F4EAFB] transition-colors">+ Add New Address</button>
                        </div>
                        
                        {loading ? (
                            <div className="flex justify-center p-10 text-[#7D2596]"><Loader className="animate-spin" /></div>
                        ) : (
                            <div className="grid gap-4">
                            {addresses.map((addr) => (
                                <div key={addr.id} onClick={() => setSelectedAddressId(addr.id)} className={`relative border rounded-lg p-5 cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-[#7D2596] bg-[#fdfaff]' : 'border-gray-200 hover:border-gray-300 bg-white'}`}>
                                   <div className="absolute top-4 right-4 flex gap-3">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(addr); }} className="text-xs font-bold text-[#7D2596] hover:underline uppercase">Edit</button>
                                    <button onClick={(e) => handleDelete(e, addr.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                  </div>
                                  <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${selectedAddressId === addr.id ? 'border-[#7D2596]' : 'border-gray-400'}`}>
                                      {selectedAddressId === addr.id && <div className="w-2 h-2 bg-[#7D2596] rounded-full" />}
                                    </div>
                                    <div className="flex-1">
                                       <p className="font-bold text-sm text-gray-800">{addr.phone}</p>
                                       <p className="text-xs text-gray-500">{addr.line1}, {addr.city} - {addr.pincode}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {addresses.length === 0 && <p className="text-gray-400 text-center">No addresses found. Please add one.</p>}
                            </div>
                        )}
                    </>
                )}
             </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Order Summary</h3>
              
              {/* Product List */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <img src={item.imageUrl || item.images?.[0]} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-800">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* ✅ PRICE BREAKDOWN */}
              <div className="border-t border-gray-100 pt-4 mb-6 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Shipping ({shippingMethod === 'vit' ? 'Pickup' : 'Pune'})</span>
                  <span className={shippingCost === 0 ? 'text-green-600 font-bold' : ''}>
                    {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base font-bold text-gray-800 pt-2 border-t border-gray-100 mt-2">
                  <span>Total Amount</span>
                  <span className="text-xl text-[#7D2596]">₹{finalTotal}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                   onClick={handlePlaceOrder} 
                   // Disable if Pune Method + No Address Selected
                   disabled={processingOrder || cartItems.length === 0 || (shippingMethod === 'pune' && !selectedAddressId)}
                   className={`w-full py-3 text-white font-bold text-sm uppercase rounded flex items-center justify-center gap-2 transition shadow-lg 
                     ${(shippingMethod === 'pune' && !selectedAddressId) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#7D2596] hover:bg-[#631d76]'}`}
                >
                  {processingOrder ? <Loader className="animate-spin" size={16} /> : <CreditCard size={16} />}
                  {processingOrder ? 'Processing...' : (shippingMethod === 'vit' ? 'Confirm Pickup' : 'Place Order')}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Address Modal (Only renders if method is 'pune') */}
      {showAddressModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
             <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800">{isEditing ? 'Edit' : 'Add'} Address</h3>
                {/* ... Address Form Inputs (Same as before) ... */}
                <input className="w-full p-3 border border-gray-200 rounded mb-3 focus:outline-none focus:border-[#7D2596]" placeholder="Line 1 (House No, Building, Street)" value={newAddress.line1} onChange={e => setNewAddress({...newAddress, line1: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <input className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-[#7D2596]" placeholder="City" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                    <input className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-[#7D2596]" placeholder="State" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                    <input className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-[#7D2596]" placeholder="Pincode" maxLength="6" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} />
                    <input className="w-full p-3 border border-gray-200 rounded focus:outline-none focus:border-[#7D2596]" placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
                </div>

                <input className="w-full p-3 border border-gray-200 rounded mb-6 focus:outline-none focus:border-[#7D2596]" placeholder="Phone Number" maxLength="10" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                
                <div className="flex justify-end gap-3">
                   <button onClick={() => setShowAddressModal(false)} className="px-5 py-2 text-gray-500 font-medium hover:bg-gray-50 rounded">Cancel</button>
                   <button onClick={handleSaveAddress} disabled={savingAddress} className="px-6 py-2 bg-[#7D2596] text-white font-bold rounded shadow-md hover:bg-[#631d76] transition-colors">
                     {savingAddress ? 'Saving...' : 'Save Address'}
                   </button>
                </div>
             </div>
         </div>
      )}
    </div>
  );
}