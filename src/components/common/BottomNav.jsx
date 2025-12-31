import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, ShoppingBag, User, X, ChevronRight, Star, ArrowLeft } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '../../config/firebase'; 
import { getCategories } from '../../services/categoryService';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- STATE FOR SEARCH OVERLAY ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [filteredCats, setFilteredCats] = useState([]);
  const [filteredProds, setFilteredProds] = useState([]);

  // Helper to check if a tab is active
  const isActive = (path) => location.pathname === path;

  // 1. FETCH DATA ON MOUNT
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
        console.error("Error loading search data:", error);
      }
    };
    fetchData();
  }, []);

  // 2. SEARCH LOGIC
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      const lowerQ = query.toLowerCase();

      // Filter Categories
      const matchingCats = categories.filter(c => c.name.toLowerCase().includes(lowerQ));
      setFilteredCats(matchingCats);

      // Filter Products
      const matchingProds = allProducts.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        (p.category && p.category.toLowerCase().includes(lowerQ))
      ).slice(0, 10); 
      setFilteredProds(matchingProds);
    } else {
      setFilteredCats([]);
      setFilteredProds([]);
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
    closeSearch();
  };

  // ✅ FIX: Accept ID instead of Name for correct filtering
  const handleCategoryClick = (catId) => {
    navigate(`/shop?category=${catId}`);
    closeSearch();
  };

  // Base styling for nav items
  const navItemClass = (path) => `
    flex flex-col items-center justify-center w-full h-full space-y-1
    ${isActive(path) ? 'text-[#7D2596]' : 'text-gray-500 hover:text-gray-900'}
    transition-colors duration-200 cursor-pointer
  `;

  return (
    <>
      {/* --- BOTTOM NAVIGATION BAR --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          
          <Link to="/" className={navItemClass('/')}>
            <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* SEARCH BUTTON (Triggers Overlay) */}
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className={navItemClass('')} 
          >
            <Search size={22} strokeWidth={isSearchOpen ? 2.5 : 2} className={isSearchOpen ? 'text-[#7D2596]' : ''}/>
            <span className={`text-[10px] font-medium ${isSearchOpen ? 'text-[#7D2596]' : ''}`}>Search</span>
          </button>

          <Link to="/wishlist" className={navItemClass('/wishlist')}>
            <Heart size={22} strokeWidth={isActive('/wishlist') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Wishlist</span>
          </Link>

          <Link to="/orders" className={navItemClass('/orders')}>
            <ShoppingBag size={22} strokeWidth={isActive('/orders') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Order</span>
          </Link>

          <Link to="/account" className={navItemClass('/account')}>
            <User size={22} strokeWidth={isActive('/account') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Account</span>
          </Link>

        </div>
      </div>

      {/* --- FULL SCREEN MOBILE SEARCH OVERLAY --- */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col md:hidden animate-in slide-in-from-bottom-5 duration-300">
          
          {/* 1. Header Area */}
          <div className="flex items-center gap-2 p-3 border-b border-gray-100 bg-white sticky top-0">
            <button onClick={closeSearch} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
               <ArrowLeft size={24} />
            </button>
            <div className="flex-1 bg-gray-100 rounded-lg flex items-center px-3 py-2">
               <Search size={18} className="text-gray-400 mr-2" />
               <input 
                 autoFocus
                 type="text"
                 value={searchQuery}
                 onChange={handleSearchChange}
                 placeholder="Search for products..."
                 className="bg-transparent border-none outline-none w-full text-sm text-gray-800 placeholder-gray-400"
               />
               {searchQuery && (
                 <button onClick={() => setSearchQuery('')}>
                   <X size={16} className="text-gray-400" />
                 </button>
               )}
            </div>
          </div>

          {/* 2. Results Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            
            {/* Case A: User hasn't typed anything yet */}
            {!searchQuery && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Type to search products...</p>
              </div>
            )}

            {/* Case B: Results Found */}
            {searchQuery && (
              <div className="space-y-6">
                
                {/* MATCHING CATEGORIES */}
                {filteredCats.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {filteredCats.map(cat => (
                        <button 
                          key={cat.id} 
                          // ✅ FIX: Pass 'cat.id' so the shop page filters correctly
                          onClick={() => handleCategoryClick(cat.id)}
                          className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 shadow-sm active:scale-95 transition-transform"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MATCHING PRODUCTS */}
                <div>
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                     Products {filteredProds.length > 0 && `(${filteredProds.length})`}
                   </h3>
                   
                   {filteredProds.length > 0 ? (
                     <div className="space-y-3">
                       {filteredProds.map(prod => (
                         <div 
                           key={prod.id} 
                           onClick={() => handleProductClick(prod.id)}
                           className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 active:bg-gray-50 transition-colors"
                         >
                           <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 flex-shrink-0 p-1">
                              <img 
                                src={prod.image || prod.images?.[0] || 'https://via.placeholder.com/60'} 
                                alt={prod.name} 
                                className="w-full h-full object-contain"
                              />
                           </div>
                           <div className="flex-1 min-w-0 flex flex-col justify-center">
                             <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight mb-1">{prod.name}</h4>
                             <div className="flex items-center justify-between">
                               <span className="text-[#7D2596] font-bold text-sm">₹{prod.price}</span>
                               <ChevronRight size={16} className="text-gray-300" />
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-10">
                       <p className="text-sm text-gray-500">No products found matching "{searchQuery}"</p>
                     </div>
                   )}
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}