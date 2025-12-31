import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Trash2, Loader } from 'lucide-react'; 
import { 
  getUserAddresses, 
  addUserAddress, 
  deleteUserAddress, 
  updateUserAddress 
} from '../../services/productService'; 

// ✅ IMPORT FIREBASE FUNCTIONS
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

  // Fetch Addresses
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
    fetchAddresses();
  }, [currentUser]);

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

  // ✅ UPDATED PLACE ORDER LOGIC (WITH STOCK CHECK & UPDATE)
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      return;
    }
    if (!currentUser) return;
    if (cartItems.length === 0) return alert("Your cart is empty!");

    try {
      setProcessingOrder(true);
      
      const shippingAddress = addresses.find(addr => addr.id === selectedAddressId);
      
      // 1. Initialize Batch
      const batch = writeBatch(db);

      // 2. CHECK STOCK FOR ALL ITEMS FIRST
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
          return; // STOP ORDER PROCESS
        }
      }

      // 3. CREATE ORDER DOCUMENT
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
        total: cartTotal,
        address: shippingAddress,
        status: 'Processing',
        paymentMethod: 'Cash On Delivery',
        date: new Date().toLocaleDateString('en-GB'),
        createdAt: serverTimestamp(),
      };

      // Add "Create Order" to batch
      batch.set(orderRef, orderData);

      // 4. DECREASE STOCK FOR EACH ITEM
      for (const item of cartItems) {
        const productRef = doc(db, 'products', item.id);
        // Fetch fresh data again (optional safety) or trust the previous check
        const productSnap = await getDoc(productRef);
        const currentStock = Number(productSnap.data().stock) || 0;
        const newStock = Math.max(0, currentStock - item.quantity);

        // Add "Update Stock" to batch
        batch.update(productRef, { stock: newStock });
      }

      // 5. COMMIT EVERYTHING AT ONCE
      await batch.commit();
      
      // Success!
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
          
          {/* LEFT: Address Section */}
          <div className="lg:w-2/3">
             <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[400px]">
                
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
             </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Your Order</h3>
              
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

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-center text-sm font-bold text-gray-800 text-lg mt-2">
                  <span>Total</span>
                  <span className="text-[#7D2596]">₹{cartTotal}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                   onClick={handlePlaceOrder} 
                   disabled={!selectedAddressId || processingOrder || cartItems.length === 0}
                   className={`w-full py-3 text-white font-bold text-sm uppercase rounded flex items-center justify-center gap-2 transition shadow-lg 
                     ${!selectedAddressId || cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#7D2596] hover:bg-[#631d76]'}`}
                >
                  {processingOrder ? <Loader className="animate-spin" size={16} /> : <CreditCard size={16} />}
                  {processingOrder ? 'Processing...' : 'Cash On Delivery'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Address Modal */}
      {showAddressModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
             <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl p-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800">{isEditing ? 'Edit' : 'Add'} Address</h3>
                
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