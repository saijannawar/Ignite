import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext'; // Import cart for 'Buy Again'
import { db, auth } from '../../config/firebase';
import { 
  collection, query, where, getDocs, orderBy, doc, updateDoc, deleteDoc 
} from 'firebase/firestore';
import { signOut, updateProfile } from 'firebase/auth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  User, Package, MapPin, LogOut, Heart, Trash2, 
  ChevronRight, Save, ShoppingCart 
} from 'lucide-react';
import Preloader from '../../components/common/Preloader';
import { getUserAddresses, deleteUserAddress } from '../../services/productService'; 

export default function MyAccount() {
  const { currentUser } = useAuth();
  const { addToCart } = useCart(); // For Buy Again button
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. AUTO-DETECT ACTIVE TAB BASED ON URL ---
  const getTabFromUrl = () => {
    const path = location.pathname;
    if (path === '/orders') return 'orders';
    if (path === '/address') return 'address';
    if (path === '/wishlist') return 'wishlist';
    return 'profile'; // Default
  };

  const [activeTab, setActiveTab] = useState(getTabFromUrl());
  const [loading, setLoading] = useState(true);

  // Sync tab if URL changes
  useEffect(() => {
    setActiveTab(getTabFromUrl());
  }, [location]);

  // Handle Tab Click
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'profile') navigate('/account');
    else navigate(`/${tab}`);
  };

  // Data States
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // --- 2. FETCH DATA ---
  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      Promise.all([fetchOrders(), fetchAddresses(), fetchWishlist()])
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), where("userId", "==", currentUser.uid), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) { console.error("Orders error", err); }
  };

  const fetchAddresses = async () => {
    try {
      const data = await getUserAddresses(currentUser.uid);
      setAddresses(data);
    } catch (err) { console.error("Address error", err); }
  };

  const fetchWishlist = async () => {
    try {
      const q = collection(db, "users", currentUser.uid, "wishlist");
      const snapshot = await getDocs(q);
      setWishlist(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) { console.error("Wishlist error", err); }
  };

  // --- 3. ACTIONS ---
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) return;
    try {
      await updateProfile(currentUser, { displayName });
      await updateDoc(doc(db, "users", currentUser.uid), { displayName });
      setIsEditingProfile(false);
      alert("Profile updated!");
    } catch (error) { console.error(error); }
  };

  const handleDeleteAddress = async (id) => {
    if (confirm("Delete this address?")) {
      await deleteUserAddress(currentUser.uid, id);
      setAddresses(addresses.filter(a => a.id !== id));
    }
  };

  const removeFromWishlist = async (id) => {
    try {
        await deleteDoc(doc(db, "users", currentUser.uid, "wishlist", id));
        setWishlist(wishlist.filter(item => item.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleBuyAgain = (item) => {
      // Re-add item to cart
      addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.image,
          quantity: 1
      });
      // Optional: Navigate to cart
      // navigate('/cart');
  };

  if (loading) return <Preloader fullScreen={false} text="Loading Account..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Your Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* --- SIDEBAR MENU --- */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
               {/* User Info Header */}
              <div className="p-6 text-center border-b border-gray-100 bg-[#fdfaff]">
                <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto flex items-center justify-center text-[#7D2596] mb-3 border-2 border-white shadow-sm">
                   {/* Initials or Icon */}
                   {currentUser?.displayName ? (
                       <span className="text-2xl font-bold">{currentUser.displayName.charAt(0).toUpperCase()}</span>
                   ) : (
                       <User size={32} />
                   )}
                </div>
                <h3 className="font-bold text-gray-800 truncate px-2">{currentUser?.displayName || 'User'}</h3>
                <p className="text-xs text-gray-500 truncate px-2">{currentUser?.email}</p>
              </div>
              
              {/* Navigation Links */}
              <nav className="flex flex-col py-2">
                <MenuButton active={activeTab === 'orders'} icon={Package} label="My Orders" onClick={() => handleTabChange('orders')} />
                <MenuButton active={activeTab === 'wishlist'} icon={Heart} label="My Wishlist" onClick={() => handleTabChange('wishlist')} />
                <MenuButton active={activeTab === 'address'} icon={MapPin} label="Addresses" onClick={() => handleTabChange('address')} />
                <MenuButton active={activeTab === 'profile'} icon={User} label="Profile" onClick={() => handleTabChange('profile')} />
                <div className="px-6 pt-2 pb-2">
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors rounded-lg">
                    <LogOut size={18} /> Logout
                    </button>
                </div>
              </nav>
            </div>
          </div>

          {/* --- MAIN CONTENT AREA --- */}
          <div className="md:w-3/4">
            
            {/* 1. ORDERS TAB (Amazon Style) */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-2xl font-bold text-gray-800">Your Orders</h2>
                
                {orders.length === 0 ? (
                  <EmptyState icon={Package} text="You haven't placed any orders yet." />
                ) : (
                  orders.map(order => (
                    // --- ORDER CARD START ---
                    <div key={order.id} className="bg-white border border-gray-300 rounded-lg overflow-hidden hover:border-gray-400 transition-colors">
                      
                      {/* Gray Header Bar */}
                      <div className="bg-[#f0f2f2] px-6 py-4 flex flex-wrap justify-between items-center text-sm text-gray-600 gap-y-2">
                         <div className="flex gap-8">
                             <div>
                                 <span className="block text-[10px] uppercase font-bold text-gray-500">Order Placed</span>
                                 <span className="text-gray-800 font-medium">{order.date || new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                             </div>
                             <div>
                                 <span className="block text-[10px] uppercase font-bold text-gray-500">Total</span>
                                 <span className="text-gray-800 font-medium">₹{order.total}</span>
                             </div>
                             <div>
                                 <span className="block text-[10px] uppercase font-bold text-gray-500">Ship To</span>
                                 <div className="relative group cursor-pointer text-[#007185] hover:text-[#c7511f] hover:underline font-medium flex items-center gap-1">
                                     {order.customerName || currentUser.displayName} <ChevronRight size={12} className="rotate-90" />
                                     {/* Tooltip for Address */}
                                     <div className="absolute top-6 left-0 w-64 bg-white border shadow-lg p-3 rounded hidden group-hover:block z-10 text-gray-800 text-xs cursor-default">
                                         <p className="font-bold mb-1">{order.customerName}</p>
                                         <p>{order.address?.line1}</p>
                                         <p>{order.address?.city}, {order.address?.pincode}</p>
                                         <p>{order.address?.state}</p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                         <div className="text-right">
                             <span className="block text-[10px] uppercase font-bold text-gray-500">Order # {order.orderId ? order.orderId.slice(0, 8).toUpperCase() : order.id.slice(0,8)}</span>
                             <Link to="#" className="text-[#007185] hover:text-[#c7511f] hover:underline font-medium">
                                 View order details
                             </Link>
                         </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6">
                        
                        {/* Delivery Status Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                           {order.status || 'Processing'} 
                           <span className="text-gray-500 text-sm font-normal ml-2">
                             {order.status === 'Delivered' ? 'Package was handed to resident' : 'Arriving soon'}
                           </span>
                        </h3>

                        {/* Items List */}
                        <div className="space-y-6">
                            {order.items?.map((item, idx) => (
                                <div key={idx} className="flex flex-col sm:flex-row gap-6">
                                    
                                    {/* Image */}
                                    <div className="flex-shrink-0">
                                        <Link to={`/product/${item.id}`}>
                                            <img 
                                              src={item.image} 
                                              alt={item.name} 
                                              className="w-24 h-24 object-contain mix-blend-multiply" 
                                            />
                                        </Link>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1">
                                        <Link to={`/product/${item.id}`} className="text-[#007185] hover:text-[#c7511f] hover:underline font-medium line-clamp-2 mb-1">
                                            {item.name}
                                        </Link>
                                        <p className="text-xs text-gray-500 mb-2">Return window closed on {order.date}</p>
                                        
                                        <div className="flex items-center gap-2">
                                            <button 
                                              onClick={() => handleBuyAgain(item)}
                                              className="bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] rounded-lg px-4 py-1.5 text-sm shadow-sm flex items-center gap-2"
                                            >
                                                <ShoppingCart size={16} /> Buy it again
                                            </button>
                                            <button 
                                               onClick={() => navigate(`/product/${item.id}`)}
                                               className="border border-gray-300 rounded-lg px-4 py-1.5 text-sm hover:bg-gray-50 shadow-sm"
                                            >
                                                View your item
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>

                      </div>
                      
                    </div>
                    // --- ORDER CARD END ---
                  ))
                )}
              </div>
            )}

            {/* 2. WISHLIST TAB */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                 <h2 className="text-2xl font-bold text-gray-800">Your Wishlist</h2>
                 {wishlist.length === 0 ? (
                    <EmptyState icon={Heart} text="Your wishlist is empty." />
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 relative group hover:shadow-lg transition-all">
                                <button 
                                  onClick={() => removeFromWishlist(item.id)} 
                                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 bg-white rounded-full p-1"
                                >
                                    <Trash2 size={18}/>
                                </button>
                                <div className="h-40 flex items-center justify-center mb-4 bg-gray-50 rounded-lg p-4">
                                   <img src={item.image} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply"/>
                                </div>
                                <h4 className="font-bold text-gray-800 line-clamp-2 text-sm mb-2 min-h-[40px]">{item.name}</h4>
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-[#7D2596] font-bold text-lg">₹{item.price}</p>
                                    <button 
                                      onClick={() => navigate(`/product/${item.productId}`)} 
                                      className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded hover:bg-[#7D2596] transition-colors"
                                    >
                                        VIEW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
              </div>
            )}

            {/* 3. ADDRESS TAB */}
            {activeTab === 'address' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                 <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Your Addresses</h2>
                    <button className="text-[#7D2596] font-bold text-sm hover:underline flex items-center gap-1">
                        + Add Address
                    </button>
                 </div>
                 {addresses.length === 0 ? (
                    <EmptyState icon={MapPin} text="No addresses saved." />
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map(addr => (
                            <div key={addr.id} className="bg-white p-6 rounded-xl border-2 border-gray-100 hover:border-[#7D2596]/30 transition-colors relative">
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-gray-400 hover:text-red-500 p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-gray-800 text-lg">{currentUser.displayName}</span>
                                    {addr.type && <span className="text-[10px] bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-gray-500 uppercase tracking-wide">{addr.type}</span>}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1 mb-4">
                                    <p>{addr.line1}</p>
                                    <p>{addr.city}, {addr.state} {addr.pincode}</p>
                                    <p>{addr.country}</p>
                                </div>
                                <p className="text-sm text-gray-800 font-medium">Phone: {addr.phone}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-sm font-medium text-[#007185]">
                                    <button className="hover:underline hover:text-[#c7511f]">Edit</button>
                                    <button className="hover:underline hover:text-[#c7511f]">Set as Default</button>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
              </div>
            )}

            {/* 4. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm animate-in fade-in duration-300 max-w-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Profile Details</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input 
                      type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={!isEditingProfile}
                      className={`w-full px-4 py-3 border rounded-lg focus:border-[#7D2596] outline-none transition-all ${isEditingProfile ? 'bg-white border-gray-300 focus:ring-2 focus:ring-[#7D2596]/20' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input type="email" value={currentUser?.email} disabled className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-400 rounded-lg cursor-not-allowed" />
                  </div>
                  <div className="pt-4 flex gap-4">
                    {isEditingProfile ? (
                      <>
                        <button onClick={handleUpdateProfile} className="px-8 py-3 bg-[#7D2596] text-white font-bold rounded-lg hover:bg-[#631d76] flex items-center gap-2 shadow-lg shadow-purple-100"><Save size={18} /> Save Changes</button>
                        <button onClick={() => setIsEditingProfile(false)} className="px-8 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setIsEditingProfile(true)} className="px-8 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors">Edit Profile</button>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
const MenuButton = ({ active, icon: Icon, label, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-4 ${active ? 'bg-purple-50 text-[#7D2596] border-[#7D2596]' : 'text-gray-600 hover:bg-gray-50 border-transparent'}`}>
    <Icon size={18} /> {label}
  </button>
);

const EmptyState = ({ icon: Icon, text }) => (
  <div className="bg-white p-12 rounded-xl text-center border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-300" />
    </div>
    <p className="text-gray-500 font-medium mb-6">{text}</p>
    <Link to="/" className="px-6 py-2 bg-[#7D2596] text-white text-sm font-bold rounded-lg hover:bg-[#631d76]">
        Start Shopping
    </Link>
  </div>
);