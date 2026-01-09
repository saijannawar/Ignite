import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Home, Grid, Zap, Heart, ShoppingBag, X, ChevronRight, FileText } from 'lucide-react';
import { getBlogs } from '../../services/blogService';
import { getBlogCategories } from '../../services/blogCategoryService';

// ✅ IMPORT LOGO (Adjust path if needed)
import viteLogo from '/vite.svg'; 

export default function BlogNavbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allBlogs, setAllBlogs] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  
  // Search Results State
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [blogsData, catsData] = await Promise.all([getBlogs(), getBlogCategories()]);
            setAllBlogs(blogsData || []);
            setAllCategories(catsData || []);
        } catch (error) {
            console.error("Error fetching search data:", error);
        }
    };
    fetchData();
  }, []);

  // 2. Filter Logic
  useEffect(() => {
    if (searchTerm.trim() === '') {
        setShowResults(false);
        return;
    }

    const lowerTerm = searchTerm.toLowerCase();

    // Filter Categories
    const matchedCats = allCategories.filter(cat => 
        cat.name.toLowerCase().includes(lowerTerm)
    );

    // Filter Posts
    const matchedPosts = allBlogs.filter(blog => 
        blog.title.toLowerCase().includes(lowerTerm) || 
        (blog.category && blog.category.toLowerCase().includes(lowerTerm))
    );

    setFilteredCategories(matchedCats);
    setFilteredPosts(matchedPosts.slice(0, 5)); 
    setShowResults(true);

  }, [searchTerm, allBlogs, allCategories]);

  // 3. Handle Outside Click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if(searchTerm.trim()) {
        navigate(`/blogs/search?search=${encodeURIComponent(searchTerm)}`);
        setShowResults(false);
        setIsSearchOpen(false);
    }
  };

  const isActive = (path) => {
      if(path === '/blogs') return location.pathname === '/blogs';
      return location.pathname.includes(path);
  };

  return (
    <>
      {/* ================= TOP NAVBAR ================= */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm font-sans h-16" ref={searchRef}>
        <div className="container mx-auto px-4 h-full flex items-center justify-between relative">
          
          {/* 1. LEFT: LOGO */}
          <div className={`${isSearchOpen ? 'hidden md:flex' : 'flex'} items-center gap-4`}>
            <Link to="/blogs" className="flex items-center gap-2 group">
              {/* ✅ UPDATED LOGO: Using vite.svg */}
              <div className="w-8 h-8 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <img src={viteLogo} alt="Ignite Logo" className="w-full h-full object-contain" />
              </div>
              
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-gray-800 leading-none tracking-tight">
                  IGNITE <span className="text-[#7D2596]">INSIGHTS</span>
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Tech & Projects
                </span>
              </div>
            </Link>
          </div>

          {/* 2. MIDDLE: DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link to="/blogs" className={`text-sm font-bold transition-colors ${isActive('/blogs') ? 'text-[#7D2596]' : 'text-gray-500 hover:text-gray-800'}`}>Home</Link>
              <Link to="/blogs/category/Tech" className={`text-sm font-bold transition-colors ${isActive('category') ? 'text-[#7D2596]' : 'text-gray-500 hover:text-gray-800'}`}>Category</Link>
              <Link to="/blogs/trending" className={`text-sm font-bold transition-colors ${isActive('trending') ? 'text-[#7D2596]' : 'text-gray-500 hover:text-gray-800'}`}>Trending</Link>
              <Link to="/blogs/saved" className={`text-sm font-bold transition-colors ${isActive('saved') ? 'text-[#7D2596]' : 'text-gray-500 hover:text-gray-800'}`}>Bookmark</Link>
          </div>

          {/* 3. RIGHT: SEARCH & ACTIONS */}
          <div className={`flex items-center gap-3 ${isSearchOpen ? 'w-full md:w-auto' : ''}`}>
              
              {/* --- SEARCH INPUT WRAPPER --- */}
              <div className={`${isSearchOpen ? 'flex-1 w-full' : 'w-auto'} relative transition-all duration-300`}>
                
                <form onSubmit={handleSearchSubmit} className={`relative ${isSearchOpen ? 'w-full' : 'hidden md:block w-64'}`}>
                    <input 
                        type="text" 
                        placeholder="Search posts..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-10 text-sm focus:outline-none focus:border-[#7D2596] focus:ring-1 focus:ring-[#7D2596] transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => { 
                            setIsSearchOpen(true); 
                            if(searchTerm) setShowResults(true); 
                        }}
                    />
                    <Search size={16} className="absolute left-3.5 top-2.5 text-gray-400"/>
                    
                    {(searchTerm || isSearchOpen) && (
                        <button 
                            type="button" 
                            onClick={() => {
                                if(searchTerm) { setSearchTerm(''); setShowResults(false); }
                                else { setIsSearchOpen(false); }
                            }} 
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-red-500"
                        >
                            <X size={16}/>
                        </button>
                    )}
                </form>

                {/* Mobile Search Trigger Icon */}
                {!isSearchOpen && (
                    <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-2 text-gray-500 hover:text-[#7D2596] transition-colors bg-gray-50 rounded-full">
                        <Search size={20} />
                    </button>
                )}

                {/* ================================================= */}
                {/* 🔍 RICH SEARCH DROPDOWN (Mega Menu Style) */}
                {/* ================================================= */}
                {showResults && (
                    <div className="absolute top-full right-0 mt-4 w-[90vw] md:w-[650px] lg:w-[750px] bg-white border border-gray-100 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2">
                        <div className="flex flex-col md:flex-row max-h-[75vh] overflow-y-auto md:overflow-visible">
                            
                            {/* LEFT: CATEGORIES (30% Width) */}
                            <div className="w-full md:w-[30%] bg-gray-50 p-5 border-b md:border-b-0 md:border-r border-gray-100">
                                <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Categories</h3>
                                {filteredCategories.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">No categories found.</p>
                                ) : (
                                    <ul className="space-y-1">
                                        {filteredCategories.slice(0, 6).map(cat => (
                                            <li key={cat.id}>
                                                <Link 
                                                    to={`/blogs/category/${encodeURIComponent(cat.name)}`}
                                                    onClick={() => setShowResults(false)}
                                                    className="flex items-center justify-between text-sm font-bold text-gray-600 hover:text-[#7D2596] hover:bg-white p-2 rounded-lg transition-all group"
                                                >
                                                    {cat.name}
                                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#7D2596]"/>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* RIGHT: POSTS (70% Width) */}
                            <div className="w-full md:w-[70%] p-5">
                                <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">Related Stories</h3>
                                {filteredPosts.length === 0 ? (
                                    <div className="text-center py-10 flex flex-col items-center justify-center">
                                        <FileText size={32} className="text-gray-200 mb-2"/>
                                        <p className="text-sm font-bold text-gray-500">No results found.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredPosts.map(blog => (
                                            <Link 
                                                key={blog.id} 
                                                to={`/blogs/${blog.id}`}
                                                onClick={() => setShowResults(false)}
                                                className="flex items-start gap-3 group hover:bg-gray-50 p-2 rounded-xl transition-colors border border-transparent hover:border-gray-100"
                                            >
                                                <div className="w-16 h-14 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden relative shadow-sm">
                                                    <img src={blog.imageUrl} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                </div>
                                                <div className="flex-1 min-w-0 flex flex-col justify-center h-14">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[9px] font-extrabold text-[#7D2596] bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wide border border-purple-100">
                                                            {blog.category || 'General'}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-bold text-gray-800 leading-tight line-clamp-2 group-hover:text-[#7D2596] transition-colors">
                                                        {blog.title}
                                                    </h4>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                
                                {filteredPosts.length > 0 && (
                                    <button 
                                        onClick={handleSearchSubmit}
                                        className="w-full mt-4 bg-gray-100 hover:bg-[#7D2596] text-gray-600 hover:text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
                                    >
                                        View All Results <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform"/>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* ================================================= */}

             </div>

             {/* Back to Shop Button */}
             {(!isSearchOpen || window.innerWidth >= 768) && (
                 <Link to="/" className="hidden md:flex items-center gap-2 text-xs font-bold text-[#7D2596] bg-purple-50 px-4 py-2 rounded-full hover:bg-[#7D2596] hover:text-white transition-all whitespace-nowrap">
                    <ArrowLeft size={14} /> Shop
                 </Link>
             )}
          </div>
        </div>
      </nav>

      {/* ================= BOTTOM BAR (MOBILE ONLY) ================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 h-16 px-6 flex items-center justify-between safe-area-bottom">
         <Link to="/blogs" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/blogs') ? 'text-[#7D2596]' : 'text-gray-400 hover:text-gray-600'}`}>
            <Home size={22} strokeWidth={isActive('/blogs') ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Home</span>
         </Link>
         <Link to="/blogs/category/Tech" className={`flex flex-col items-center gap-1 transition-colors ${isActive('category') ? 'text-[#7D2596]' : 'text-gray-400 hover:text-gray-600'}`}>
            <Grid size={22} strokeWidth={isActive('category') ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Category</span>
         </Link>
         <Link to="/blogs/trending" className={`flex flex-col items-center gap-1 transition-colors ${isActive('trending') ? 'text-[#7D2596]' : 'text-gray-400 hover:text-gray-600'}`}>
            <Zap size={22} strokeWidth={isActive('trending') ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Trending</span>
         </Link>
         <Link to="/blogs/saved" className={`flex flex-col items-center gap-1 transition-colors ${isActive('saved') ? 'text-[#7D2596]' : 'text-gray-400 hover:text-gray-600'}`}>
            <Heart size={22} strokeWidth={isActive('saved') ? 2.5 : 2} />
            <span className="text-[10px] font-bold">Bookmark</span>
         </Link>
         <Link to="/" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#7D2596] transition-colors">
            <ShoppingBag size={22} />
            <span className="text-[10px] font-bold">Shop</span>
         </Link>
      </div>
    </>
  );
}