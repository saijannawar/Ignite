import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, Heart, Menu, User, LogOut, Grid, MapPin, ShoppingBag, X, Star
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { auth, db } from '../../config/firebase'; 
import { collection, getDocs } from 'firebase/firestore'; 
import { getCategories } from '../../services/categoryService';
import CartDrawer from '../../components/client/CartDrawer';

export default function Navbar({ onOpenSidebar }) {
  const { currentUser } = useAuth();
  const { cartCount, openCart } = useCart(); 
  
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [allProducts, setAllProducts] = useState([]); 
  const [filteredCats, setFilteredCats] = useState([]);
  const [filteredProds, setFilteredProds] = useState([]);
  const [topCategory, setTopCategory] = useState(null);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // 1. Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchOverlay(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catsData = await getCategories();
        setCategories(catsData);

        const querySnapshot = await getDocs(collection(db, "products"));
        const prodsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllProducts(prodsData);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  // --- SEARCH LOGIC ---
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      setShowSearchOverlay(true);
      const lowerQ = query.toLowerCase();

      // 1. Filter Categories
      const matchingCats = categories.filter(c => 
        c.name.toLowerCase().includes(lowerQ)
      );
      setFilteredCats(matchingCats);

      // 2. Filter Products
      const matchingProds = allProducts.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        (p.category && p.category.toLowerCase().includes(lowerQ))
      ).slice(0, 6); 
      setFilteredProds(matchingProds);

      // 3. Determine "Top Category" logic
      if (matchingCats.length > 0) {
        setTopCategory(matchingCats[0]);
      } else if (matchingProds.length > 0) {
        const firstProd = matchingProds[0];
        if (firstProd.category) {
            // Find the full category object using the product's category ID
            const foundCat = categories.find(c => c.id === firstProd.category);
            setTopCategory(foundCat || null);
        } else {
            setTopCategory(null);
        }
      } else {
        setTopCategory(null);
      }
    } else {
      setShowSearchOverlay(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchOverlay(false);
  };

  return (
    <>
      <header className="bg-white sticky top-0 z-40 shadow-sm font-sans">
        
        {/* --- TOP BAR --- */}
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 border-b border-gray-100 relative">
          
          {/* 1. LEFT: Logo */}
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-700 p-1 hover:bg-gray-100 rounded" onClick={onOpenSidebar}>
              <Menu className="w-6 h-6" />
            </button>

            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-[#7D2596] text-white p-2 rounded-lg group-hover:bg-[#631d76] transition-colors">
                  <ShoppingCart className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                  <span className="text-xl font-extrabold tracking-tight text-gray-800 leading-none">
                    IGNITE<span className="text-[#C569E0]">NOW</span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold tracking-[0.15em] uppercase hidden sm:block">
                    Ideas Into Reality
                  </span>
              </div>
            </Link>
          </div>

          {/* 2. CENTER: SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <div className={`flex items-center w-full bg-gray-50 border ${showSearchOverlay ? 'border-[#7D2596] ring-1 ring-[#7D2596]' : 'border-gray-200'} rounded-lg transition-all`}>
              <Search className="w-4 h-4 text-gray-400 ml-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.length > 1 && setShowSearchOverlay(true)}
                placeholder="Search for products..." 
                className="w-full bg-transparent border-none py-2.5 px-3 focus:ring-0 outline-none text-sm text-gray-700 placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={clearSearch} className="mr-3 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* --- MEGA SEARCH OVERLAY --- */}
            {showSearchOverlay && (
              <div className="absolute top-full left-0 w-[140%] -ml-[20%] mt-2 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-row min-h-[400px]">
                
                {/* LEFT: Categories & Products List */}
                <div className="w-3/5 border-r border-gray-100 flex flex-col">
                  
                  {/* Matching Categories */}
                  {filteredCats.length > 0 && (
                    <div className="p-4 pb-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</h4>
                      <ul className="space-y-2">
                        {filteredCats.map(cat => (
                          <li key={cat.id}>
                             {/* ✅ FIX: Use 'cat.id' in URL so filtering works, but show 'cat.name' */}
                             <Link to={`/shop?category=${cat.id}`} onClick={clearSearch} className="block hover:bg-gray-50 p-1 rounded">
                               <div className="text-sm font-semibold text-gray-800 hover:text-[#7D2596]">{cat.name}</div>
                             </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="h-px bg-gray-100 mx-4 my-2"></div>

                  {/* Matching Products */}
                  <div className="p-4 pt-2 flex-1 overflow-y-auto">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Products</h4>
                    {filteredProds.length > 0 ? (
                      <ul className="space-y-3">
                        {filteredProds.map(prod => (
                          <li key={prod.id}>
                            <Link to={`/product/${prod.id}`} onClick={clearSearch} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors group">
                              <div className="w-10 h-10 border border-gray-200 rounded bg-white p-0.5 flex-shrink-0">
                                <img src={prod.image || prod.images?.[0] || 'https://via.placeholder.com/50'} alt={prod.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-700 truncate group-hover:text-[#7D2596]">{prod.name}</div>
                                <div className="text-sm font-bold text-gray-900">₹{prod.price}</div>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No products found.</p>
                    )}
                  </div>
                </div>

                {/* RIGHT: Featured Showcase */}
                <div className="w-2/5 bg-gray-50 p-5 flex flex-col">
                   {topCategory ? (
                     <>
                       <div className="mb-4">
                         <span className="text-xs font-bold text-gray-500 uppercase">Category: </span>
                         <span className="text-sm font-bold text-[#7D2596]">{topCategory.name}</span>
                       </div>
                       
                       <div className="grid grid-cols-1 gap-4">
                         {allProducts
                            .filter(p => p.category === topCategory.id) // Filter using ID
                            .slice(0, 2)
                            .map(item => (
                              <Link to={`/product/${item.id}`} onClick={clearSearch} key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex gap-3 items-center hover:shadow-md transition-all">
                                <img src={item.image || item.images?.[0] || 'https://via.placeholder.com/50'} className="w-14 h-14 object-contain" alt="" />
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">{item.name}</h5>
                                  <div className="flex items-center gap-1 mt-1 mb-1">
                                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-yellow-400 fill-yellow-400"/>)}
                                  </div>
                                  <div className="font-bold text-gray-900 text-sm">₹{item.price}</div>
                                </div>
                              </Link>
                            ))
                         }
                       </div>
                       
                       {/* ✅ FIX: Use 'topCategory.id' in URL so the Shop page filter matches the product data */}
                       <Link 
                         to={`/shop?category=${topCategory.id}`} 
                         onClick={clearSearch}
                         className="mt-auto w-full py-2 bg-[#7D2596] text-white text-xs font-bold rounded shadow-sm hover:bg-[#631d76] transition-colors text-center block"
                       >
                         View All in {topCategory.name}
                       </Link>
                     </>
                   ) : (
                     <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center">
                       Keep typing to see<br/>live suggestions...
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>

          {/* 3. RIGHT: User Actions */}
          <div className="flex items-center gap-6">
            {/* USER PROFILE SECTION - RESTORED FULLY */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
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

                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="md:hidden w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600"
                >
                   <User className="w-5 h-5" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="absolute -top-[6px] right-6 w-3 h-3 bg-white border-t border-l border-gray-100 rotate-45"></div>

                    <Link to="/account" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#7D2596] transition-colors">
                      <User className="w-4 h-4" /> My Account
                    </Link>
                    <Link to="/address" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#7D2596] transition-colors">
                      <MapPin className="w-4 h-4" /> Address
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#7D2596] transition-colors">
                      <ShoppingBag className="w-4 h-4" /> Orders
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#7D2596] transition-colors">
                      <Heart className="w-4 h-4" /> My List
                    </Link>
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#7D2596] text-left transition-colors">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-[#7D2596]">Login</Link>
            )}

            <Link to="/wishlist" className="hidden md:block text-gray-500 hover:text-[#7D2596] transition-colors">
              <Heart className="w-6 h-6" />
            </Link>

            <button onClick={openCart} className="relative text-gray-500 hover:text-[#7D2596] transition-colors pr-1 outline-none">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1 bg-[#7D2596] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* --- BOTTOM BAR (Navigation) --- */}
        <div className="border-b border-gray-100 bg-white">
          <div className="container mx-auto px-4">
             <nav className="flex items-center justify-center md:justify-between h-10 md:h-12">
               <button onClick={onOpenSidebar} className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors">
                  <Grid className="w-3.5 h-3.5" /> SHOP BY CATEGORIES
               </button>

               <div className="hidden md:flex gap-8 text-[13px] font-semibold text-gray-500 tracking-wide">
                  <Link to="/" className="hover:text-[#7D2596] transition-colors uppercase">Home</Link>
                  <a href="https://wa.me/919011401920" target="_blank" rel="noopener noreferrer" className="hover:text-[#7D2596] transition-colors uppercase">Bulk Enquiry</a>
                  <Link to="/about" className="hover:text-[#7D2596] transition-colors uppercase">About</Link>
               </div>

               <a href="https://wa.me/919011401920" target="_blank" rel="noopener noreferrer" className="text-[#7D2596] text-xs font-bold hover:underline flex items-center gap-1">
                 Need Project Help? 💬
               </a>
             </nav>
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}