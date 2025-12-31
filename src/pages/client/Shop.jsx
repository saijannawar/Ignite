import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, Grid, List, ChevronDown, Check, Star, ArrowUpDown } from 'lucide-react';
import { getProducts } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import ProductCard from '../../components/client/ProductCard'; 

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState(30000); 
  const [selectedRating, setSelectedRating] = useState(0); 
  const [sortBy, setSortBy] = useState('Name, A to Z');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        
        const formattedProducts = productsData.map(p => {
            const reviewsList = Array.isArray(p.reviews) ? p.reviews : [];
            const reviewCount = reviewsList.length;
            const avg = reviewCount > 0 ? reviewsList.reduce((sum, r) => sum + (Number(r.rating)||0), 0) / reviewCount : (Number(p.rating)||0);
            return {
                ...p,
                originalPrice: p.originalPrice || Math.round(p.price * 1.2), 
                brand: p.brand || "Brand", 
                rating: parseFloat(avg.toFixed(1)), 
                reviews: reviewCount, 
                img: p.imageUrl || (p.images && p.images[0]) || p.img || 'https://via.placeholder.com/300'
            };
        });

        setProducts(formattedProducts);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...products];
    if (activeCategory && activeCategory !== 'All') result = result.filter(p => p.category === activeCategory || p.categoryId === activeCategory);
    result = result.filter(p => Number(p.price) <= priceRange);
    if (selectedRating > 0) result = result.filter(p => p.rating >= selectedRating);

    if (sortBy === 'Name, A to Z') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'Name, Z to A') result.sort((a, b) => b.name.localeCompare(a.name));
    else if (sortBy === 'Price, Low to High') result.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === 'Price, High to Low') result.sort((a, b) => Number(b.price) - Number(a.price));

    setFilteredProducts(result);
  }, [products, activeCategory, priceRange, selectedRating, sortBy]);

  const handleCategoryClick = (catId) => {
    setSearchParams(catId === 'All' ? {} : { category: catId });
    setShowMobileFilter(false);
  };

  return (
    <div className="bg-[#f3e5f5] min-h-screen font-sans pb-24 md:pb-0"> 
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 relative items-start">
        
        {/* ==================== SIDEBAR ==================== */}
        <aside className={`
          fixed inset-0 z-50 bg-white transform transition-transform duration-300 
          md:relative md:transform-none md:w-64 md:block md:bg-transparent md:shadow-none 
          md:sticky md:top-24 md:h-[calc(100vh-120px)] md:overflow-y-auto md:z-0
          ${showMobileFilter ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          scrollbar-hide
        `}>
          <div className="h-full p-5 md:p-0 bg-white md:bg-transparent overflow-y-auto">
             <div className="flex justify-between items-center md:hidden mb-6">
                <h2 className="text-xl font-bold text-[#7b1fa2]">Filters</h2>
                <button onClick={() => setShowMobileFilter(false)}><X size={24} /></button>
             </div>

             {/* Category Filter */}
             <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-[#7b1fa2] mb-4 text-sm border-b pb-2">Shop by Category</h3>
                <ul className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  <li className="flex items-center gap-3 cursor-pointer group" onClick={() => handleCategoryClick('All')}>
                      <div className={`w-4 h-4 border rounded flex items-center justify-center ${activeCategory === 'All' ? 'bg-[#7b1fa2] border-[#7b1fa2]' : 'border-gray-300 group-hover:border-[#7b1fa2]'}`}>
                        {activeCategory === 'All' && <Check size={12} className="text-white" />}
                      </div>
                      <span className={`text-sm ${activeCategory === 'All' ? 'text-[#7b1fa2] font-bold' : 'text-gray-600 group-hover:text-[#7b1fa2]'}`}>All Products</span>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleCategoryClick(cat.id)}>
                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${activeCategory === cat.id ? 'bg-[#7b1fa2] border-[#7b1fa2]' : 'border-gray-300 group-hover:border-[#7b1fa2]'}`}>
                          {activeCategory === cat.id && <Check size={12} className="text-white" />}
                        </div>
                        <span className={`text-sm ${activeCategory === cat.id ? 'text-[#7b1fa2] font-bold' : 'text-gray-600 group-hover:text-[#7b1fa2]'}`}>{cat.name}</span>
                    </li>
                  ))}
                </ul>
             </div>

             {/* Price Filter (Max 30,000) */}
             <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-[#7b1fa2] mb-4 text-sm border-b pb-2">Filter By Price</h3>
                <div className="px-1 py-2">
                   <input 
                     type="range" min="0" max="30000" step="100" 
                     value={priceRange} 
                     onChange={(e) => setPriceRange(Number(e.target.value))}
                     className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#7b1fa2]"
                   />
                   <div className="flex justify-between mt-3 text-sm text-gray-600 font-bold">
                     <span>₹0</span>
                     <span className="text-[#7b1fa2]">₹{priceRange.toLocaleString()}</span>
                   </div>
                </div>
             </div>

             {/* Rating Filter */}
             <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-bold text-[#7b1fa2] mb-4 text-sm border-b pb-2">Filter By Rating</h3>
                <ul className="space-y-2">
                   {[5, 4, 3, 2, 1].map((star) => (
                      <li key={star} className="flex items-center gap-3 cursor-pointer hover:bg-purple-50 p-1 rounded" onClick={() => setSelectedRating(star === selectedRating ? 0 : star)}>
                         <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedRating === star ? 'bg-[#7b1fa2] border-[#7b1fa2]' : 'border-gray-300'}`}>
                            {selectedRating === star && <Check size={12} className="text-white" />}
                         </div>
                         <div className="flex items-center text-yellow-400">
                           {[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < star ? "currentColor" : "none"} className={i < star ? "text-yellow-400" : "text-gray-300"} />))}
                           <span className="text-xs text-gray-400 ml-2 font-medium">& Up</span>
                         </div>
                      </li>
                   ))}
                </ul>
             </div>
          </div>
        </aside>

        {/* ==================== MAIN CONTENT ==================== */}
        <main className="flex-1 w-full">
          {/* Top Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-16 md:static z-20">
             <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-2 border-r pr-4 border-gray-300">
                   <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-purple-100 text-[#7b1fa2]' : 'text-gray-400 hover:text-[#7b1fa2]'}`}><List size={20} /></button>
                   <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-purple-100 text-[#7b1fa2]' : 'text-gray-400 hover:text-[#7b1fa2]'}`}><Grid size={20} /></button>
                </div>
                <span className="text-gray-500 text-sm">Showing <b>{filteredProducts.length}</b> products</span>
             </div>

             <div className="relative w-full md:w-auto">
                <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="flex items-center gap-2 border px-3 py-1.5 rounded text-sm bg-white font-medium w-full md:min-w-[160px] justify-between hover:border-[#7b1fa2] text-gray-700 transition-colors">
                   {sortBy} <ChevronDown size={14} />
                </button>
                {showSortDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-full md:w-48 bg-white border rounded shadow-lg z-50">
                       {['Name, A to Z', 'Name, Z to A', 'Price, Low to High', 'Price, High to Low'].map(opt => (
                           <div key={opt} onClick={() => { setSortBy(opt); setShowSortDropdown(false); }} className={`p-2 text-sm cursor-pointer hover:bg-purple-50 ${sortBy === opt ? 'text-[#7b1fa2] font-bold bg-purple-50' : 'text-gray-700'}`}>{opt}</div>
                       ))}
                    </div>
                )}
             </div>
          </div>

          {/* Product Grid */}
          {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"><div className="h-60 bg-gray-100 rounded animate-pulse"></div></div>
          ) : filteredProducts.length === 0 ? (
             <div className="text-center py-20 bg-white border rounded-lg">
                 <p className="text-gray-500">No products found.</p>
                 <button onClick={() => {setPriceRange(30000); setSearchParams({})}} className="text-[#7b1fa2] font-bold mt-2 hover:underline">Clear Filters</button>
             </div>
          ) : (
             <div className={`grid gap-3 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
                {filteredProducts.map((product) => (
                   <div key={product.id} className="h-full">
                      <ProductCard product={product} viewMode={viewMode} />
                   </div>
                ))}
             </div>
          )}
        </main>
      </div>
      
      {/* Mobile Filter Button (Floating) */}
      <button 
        className="md:hidden fixed bottom-20 right-4 z-50 bg-[#7b1fa2] text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:bg-purple-800 hover:scale-105 transition-all"
        onClick={() => setShowMobileFilter(true)}
      >
        <Filter size={20} />
      </button>

      {/* Overlay */}
      {showMobileFilter && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMobileFilter(false)} />}
      
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default Shop;