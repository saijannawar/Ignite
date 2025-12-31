import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, MapPin, Heart, ShoppingBag, LogOut, Plus, X, Trash2, 
  ChevronDown, ChevronUp, Star, MoreVertical, Edit2 
} from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { 
  addUserAddress, 
  getUserAddresses, 
  getUserWishlist,      
  removeFromWishlist,
  getUserOrders,
  deleteUserAddress, // ✅ Imported
  updateUserAddress  // ✅ Imported
} from '../../services/productService'; 

export default function MyAccount() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]); 
  const [orders, setOrders] = useState([]); 
  
  // Profile State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // New: Track Edit Mode
  const [editId, setEditId] = useState(null); // New: ID being edited
  const [openMenuId, setOpenMenuId] = useState(null); // New: Which card menu is open
  const [savingAddress, setSavingAddress] = useState(false);

  const [newAddress, setNewAddress] = useState({
    line1: '', city: '', state: '', pincode: '', country: '', phone: '', type: 'Home'
  });

  // --- INIT DATA ---
  useEffect(() => {
    if (location.pathname === '/orders') setActiveTab('orders');
    else if (location.pathname === '/wishlist') setActiveTab('wishlist');
    else if (location.pathname === '/address') setActiveTab('address');
    else setActiveTab('profile');

    if (currentUser) {
      setFullName(currentUser.displayName || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phoneNumber || '');
      fetchData(); 
    }
  }, [location, currentUser]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const [addr, wish, ord] = await Promise.all([
        getUserAddresses(currentUser.uid),
        getUserWishlist(currentUser.uid),
        getUserOrders(currentUser.uid)
      ]);
      setAddresses(addr);
      setWishlist(wish);
      // Sort orders latest first
      setOrders(ord.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)));
    } catch (error) {
      console.error("Error loading account data:", error);
    }
  };

  // --- HANDLERS ---
  const switchTab = (tab, path) => {
    setActiveTab(tab);
    navigate(path, { replace: true });
  };

  // 1. Open Add Modal
  const handleOpenAdd = () => {
    setNewAddress({ line1: '', city: '', state: '', pincode: '', country: '', phone: '', type: 'Home' });
    setIsEditing(false);
    setEditId(null);
    setShowAddressModal(true);
  };

  // 2. Open Edit Modal
  const handleOpenEdit = (addr) => {
    setNewAddress(addr);
    setIsEditing(true);
    setEditId(addr.id);
    setShowAddressModal(true);
    setOpenMenuId(null); // Close menu
  };

  // 3. Save Address (with Validation)
  const handleSaveAddress = async () => {
    // --- VALIDATION ---
    if (!newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.pincode || !newAddress.country || !newAddress.phone) {
      alert("Please fill in ALL address fields.");
      return;
    }
    if (newAddress.phone.length !== 10 || isNaN(newAddress.phone)) {
      alert("Mobile number must be exactly 10 digits.");
      return;
    }

    if (!currentUser) return;

    try {
      setSavingAddress(true);
      
      if (isEditing) {
        // Update
        await updateUserAddress(currentUser.uid, editId, newAddress);
        setAddresses(addresses.map(a => a.id === editId ? { ...newAddress, id: editId } : a));
        alert("Address updated successfully!");
      } else {
        // Add
        const savedAddr = await addUserAddress(currentUser.uid, newAddress);
        setAddresses([...addresses, savedAddr]);
        alert("Address added successfully!");
      }
      setShowAddressModal(false);
    } catch (error) {
      alert("Failed to save address");
    } finally {
      setSavingAddress(false);
    }
  };

  // 4. Delete Address
  const handleDeleteAddress = async (id) => {
    if(window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteUserAddress(currentUser.uid, id);
        setAddresses(addresses.filter(a => a.id !== id));
      } catch (error) {
        alert("Failed to delete address");
      }
    }
    setOpenMenuId(null);
  };

  const handleUpdateProfile = async () => { 
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: fullName });
      alert("Profile updated!");
    } catch (error) { alert("Error updating profile"); }
    finally { setLoading(false); }
  };

  const handleRemoveWishlist = async (productId) => {
    if (window.confirm("Remove item?")) {
      await removeFromWishlist(currentUser.uid, productId);
      setWishlist(prev => prev.filter(item => (item.productId || item.id) !== productId));
    }
  };

  const handleLogout = async () => { await auth.signOut(); navigate('/login'); };

  // --- COMPONENTS ---
  const OrderRow = ({ order }) => {
    const [expanded, setExpanded] = useState(false);
    return (
      <div className="bg-[#232f3e] text-gray-300 text-xs mb-4 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600">
          <div className="min-w-[1200px] flex items-center border-b border-gray-700 py-4 px-4">
            <div className="w-12 flex-shrink-0 flex justify-center">
              <button onClick={() => setExpanded(!expanded)} className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors">
                {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              </button>
            </div>
            <div className="w-48 flex-shrink-0 px-2 text-[#ff4d4d] font-bold truncate">{order.id}</div>
            <div className="w-40 flex-shrink-0 px-2 text-[#ff4d4d] font-bold uppercase">{order.paymentMethod || 'COD'}</div>
            <div className="w-32 flex-shrink-0 px-2 truncate">{order.customerName}</div>
            <div className="w-32 flex-shrink-0 px-2">{order.address?.phone}</div>
            <div className="w-64 flex-shrink-0 px-2 truncate" title={order.address?.line1}>{order.address?.line1}, {order.address?.city}</div>
            <div className="w-24 flex-shrink-0 px-2">{order.address?.pincode}</div>
            <div className="w-24 flex-shrink-0 px-2 font-bold text-white">₹{order.total}</div>
            <div className="w-48 flex-shrink-0 px-2 truncate">{order.email}</div>
            <div className="w-24 flex-shrink-0 px-2 text-center"><span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">{order.status || 'Confirm'}</span></div>
            <div className="w-24 flex-shrink-0 px-2 text-right">{order.date || order.createdAt?.slice(0,10)}</div>
          </div>
        </div>
        {expanded && (
          <div className="bg-[#2c3e50] p-4 border-t border-gray-600 animate-in slide-in-from-top-2">
            <div className="flex text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-600 pb-2">
              <div className="w-48">Product ID</div><div className="flex-1">Product Title</div><div className="w-24 text-center">Image</div><div className="w-24 text-center">Quantity</div><div className="w-24 text-right">Price</div><div className="w-24 text-right">Sub Total</div>
            </div>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center text-gray-300 py-3 border-b border-gray-600/50 last:border-0">
                <div className="w-48 truncate pr-2 opacity-70">{item.id || item.productId}</div>
                <div className="flex-1 font-medium text-blue-200">{item.name}</div>
                <div className="w-24 flex justify-center"><div className="w-10 h-10 bg-white rounded p-1"><img src={item.imageUrl || item.images?.[0]} alt="" className="w-full h-full object-contain" /></div></div>
                <div className="w-24 text-center">{item.quantity}</div>
                <div className="w-24 text-right">₹{item.price}</div>
                <div className="w-24 text-right font-bold text-white">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const SidebarBtn = ({ id, icon, label, path }) => (
    <button onClick={() => switchTab(id, path)} className={`w-full flex items-center gap-4 px-6 py-4 border-l-4 text-left transition-all ${activeTab === id ? 'border-[#ff4d4d] text-[#ff4d4d] bg-gray-50' : 'border-transparent text-gray-600 hover:bg-gray-50'}`}>
      {icon}<span className="font-medium text-sm">{label}</span>
    </button>
  );

  return (
    <div className="bg-[#f1f3f6] min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT SIDEBAR */}
          <div className="w-full lg:w-1/4 flex-shrink-0">
            <div className="bg-white shadow-sm rounded-lg p-6 flex flex-col items-center text-center mb-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mb-3 border-4 border-gray-100">
                {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <User className="text-gray-400 w-10 h-10" />}
              </div>
              <h3 className="font-bold text-gray-800 text-lg">{currentUser?.displayName || 'User'}</h3>
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            </div>
            <div className="bg-white shadow-sm rounded-lg overflow-hidden flex flex-col">
              <SidebarBtn id="profile" icon={<User size={18}/>} label="My Profile" path="/account" />
              <SidebarBtn id="address" icon={<MapPin size={18}/>} label="Address" path="/address" />
              <SidebarBtn id="wishlist" icon={<Heart size={18}/>} label="My List" path="/wishlist" />
              <SidebarBtn id="orders" icon={<ShoppingBag size={18}/>} label="My Orders" path="/orders" />
              <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-4 border-l-4 border-transparent text-left text-gray-600 hover:bg-gray-50 border-t border-gray-100"><LogOut size={18} /><span className="font-medium text-sm">Logout</span></button>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="w-full lg:w-3/4">
            
            {/* 1. PROFILE */}
            {activeTab === 'profile' && (
               <div className="bg-white shadow-sm rounded-lg p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">My Profile</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex flex-col gap-2"><label className="text-xs font-semibold text-gray-500">Full Name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="p-3 border border-gray-300 rounded text-sm focus:border-[#ff4d4d] outline-none" /></div>
                    <div className="flex flex-col gap-2"><label className="text-xs font-semibold text-gray-500">Email</label><input type="email" value={email} disabled className="p-3 border border-gray-300 rounded bg-gray-50 text-gray-500 text-sm cursor-not-allowed" /></div>
                  </div>
                  <div className="flex flex-col gap-2 mb-8 md:w-1/2"><label className="text-xs font-semibold text-gray-500">Phone Number</label><div className="flex"><div className="bg-gray-100 border border-gray-300 border-r-0 rounded-l px-3 flex items-center justify-center">IN</div><input type="text" value={phone} placeholder="+91" onChange={(e) => setPhone(e.target.value)} className="p-3 border border-gray-300 rounded-r w-full text-sm focus:border-[#ff4d4d] outline-none" /></div></div>
                  <button onClick={handleUpdateProfile} disabled={loading} className="bg-[#ff4d4d] text-white px-8 py-3 rounded font-bold text-sm hover:bg-red-600 uppercase">{loading ? 'Updating...' : 'Update Profile'}</button>
               </div>
            )}
            
            {/* 2. ADDRESS (UPDATED UI) */}
            {activeTab === 'address' && (
               <div className="bg-white shadow-sm rounded-lg p-6 min-h-[500px]">
                  <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Address</h2>
                  
                  {/* Add New Button Block */}
                  <div 
                    onClick={handleOpenAdd}
                    className="w-full bg-[#f0f9ff] border border-dashed border-[#bee3f8] text-[#3182ce] font-medium py-4 rounded-md flex items-center justify-center cursor-pointer hover:bg-[#e6f6ff] transition-colors mb-6"
                  >
                    Add Address
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-gray-200 p-5 rounded-lg relative bg-white group">
                        <div className="flex justify-between items-start">
                           <div>
                             <span className="bg-gray-100 text-[10px] px-2 py-0.5 rounded font-bold text-gray-500 uppercase tracking-wide inline-block mb-2">{addr.type}</span>
                             <div className="flex gap-4 mb-1">
                               <span className="font-bold text-gray-800 text-sm">{currentUser.displayName || 'User'}</span>
                               <span className="font-bold text-gray-800 text-sm">{addr.phone}</span>
                             </div>
                             <p className="text-xs text-gray-500">{addr.line1}, {addr.city} {addr.state} {addr.pincode}</p>
                           </div>
                           
                           {/* THREE DOTS MENU */}
                           <div className="relative">
                             <button 
                               onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === addr.id ? null : addr.id); }}
                               className="p-1 hover:bg-gray-100 rounded-full text-gray-400"
                             >
                               <MoreVertical size={18} />
                             </button>
                             
                             {/* DROPDOWN POPUP */}
                             {openMenuId === addr.id && (
                               <div className="absolute right-0 top-8 bg-white border border-gray-100 shadow-lg rounded w-32 py-1 z-10 animate-in fade-in zoom-in-95 duration-100">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleOpenEdit(addr); }}
                                   className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                 >
                                   <Edit2 size={12} /> Edit
                                 </button>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                                   className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                                 >
                                   <Trash2 size={12} /> Delete
                                 </button>
                               </div>
                             )}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            )}

            {/* 3. WISHLIST */}
            {activeTab === 'wishlist' && (
               <div className="bg-white shadow-sm rounded-lg p-6">
                  <div className="border-b border-gray-100 pb-4 mb-4"><h2 className="text-xl font-bold text-gray-800">My List</h2><p className="text-xs text-gray-400 mt-1">There are <span className="font-bold text-[#ff4d4d]">{wishlist.length}</span> products in your My List</p></div>
                  <div className="space-y-4">
                    {wishlist.length === 0 ? <div className="py-16 text-center text-gray-400">Empty Wishlist</div> : wishlist.map(item => (
                        <div key={item.id} className="border border-gray-200 rounded p-4 flex gap-4 bg-white relative">
                          <div className="w-32 h-32 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center p-2"><img src={item.image || "https://via.placeholder.com/150"} className="max-h-full max-w-full object-contain mix-blend-multiply" alt="" /></div>
                          <div className="flex-1 py-1"><h3 className="font-bold text-gray-800 text-base mb-2">{item.name}</h3><span className="font-bold text-gray-800 text-lg">₹{item.price}</span></div>
                          <button onClick={() => handleRemoveWishlist(item.productId || item.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><X size={20}/></button>
                        </div>
                    ))}
                  </div>
               </div>
            )}

            {/* 4. ORDERS */}
            {activeTab === 'orders' && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <div className="border-b border-gray-100 pb-4 mb-4"><h2 className="text-xl font-bold text-gray-800">My Orders</h2><p className="text-xs text-gray-400 mt-1">There are <span className="font-bold text-[#ff4d4d]">{orders.length}</span> orders</p></div>
                {orders.length === 0 ? <div className="text-center py-10">No orders</div> : 
                   <div className="space-y-6">
                     <div className="hidden lg:block bg-[#343a40] text-gray-400 text-[10px] font-bold uppercase tracking-wider py-3 px-4 rounded-t-sm"><div className="flex items-center min-w-[1200px] overflow-x-auto"><div className="w-12 text-center">#</div><div className="w-48 px-2">Order ID</div><div className="w-40 px-2">Payment ID</div><div className="w-32 px-2">Name</div><div className="w-32 px-2">Phone Number</div><div className="w-64 px-2">Address</div><div className="w-24 px-2">Pincode</div><div className="w-24 px-2">Total Amount</div><div className="w-48 px-2">Email</div><div className="w-24 px-2 text-center">Order Status</div><div className="w-24 px-2 text-right">Date</div></div></div>
                     {orders.map(order => <OrderRow key={order.id} order={order} />)}
                   </div>
                }
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Edit Address' : 'Add Delivery Address'}</h3>
              <button onClick={() => setShowAddressModal(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
               <input type="text" placeholder="Address Line 1" className="w-full p-3 border border-gray-300 rounded text-sm outline-none" value={newAddress.line1} onChange={e => setNewAddress({...newAddress, line1: e.target.value})} />
               <input type="text" placeholder="City" className="w-full p-3 border border-gray-300 rounded text-sm outline-none" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
               <div className="grid grid-cols-2 gap-4">
                 <input type="text" placeholder="State" className="p-3 border border-gray-300 rounded text-sm outline-none" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                 <input type="text" placeholder="Pincode" maxLength="6" className="p-3 border border-gray-300 rounded text-sm outline-none" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} />
               </div>
               <input type="text" placeholder="Country" className="w-full p-3 border border-gray-300 rounded text-sm outline-none" value={newAddress.country} onChange={e => setNewAddress({...newAddress, country: e.target.value})} />
               <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                  <div className="bg-gray-50 px-3 py-3 border-r border-gray-300 flex items-center gap-2 text-sm text-gray-600">IN +91</div>
                  <input type="text" placeholder="Phone (10 digits)" maxLength="10" className="flex-1 p-3 text-sm outline-none" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value.replace(/\D/g,'')})} />
               </div>
               <div className="flex gap-6 pt-2">
                   <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="addrType" checked={newAddress.type === 'Home'} onChange={() => setNewAddress({...newAddress, type: 'Home'})} className="accent-[#ff4d4d] w-4 h-4" /><span className="text-sm font-bold text-gray-600">Home</span></label>
                   <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="addrType" checked={newAddress.type === 'Office'} onChange={() => setNewAddress({...newAddress, type: 'Office'})} className="accent-[#ff4d4d] w-4 h-4" /><span className="text-sm font-bold text-gray-600">Office</span></label>
               </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end border-t border-gray-100">
              <button onClick={handleSaveAddress} disabled={savingAddress} className="w-full bg-[#ff4d4d] text-white py-3 rounded font-bold text-sm hover:bg-red-600 shadow-md uppercase">{savingAddress ? 'Saving...' : 'Save Address'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}