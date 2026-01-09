import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; 
import { getBlogCategories } from '../../../services/blogCategoryService'; 
import { getBlogs } from '../../../services/blogService';
import Preloader from '../../../components/common/Preloader';

export default function BlogCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsData, blogsData] = await Promise.all([
            getBlogCategories(), 
            getBlogs()
        ]);

        // Calculate counts for each category
        const catsWithCount = catsData.map(cat => {
            const count = blogsData.filter(b => b.category === cat.name).length;
            return { ...cat, count };
        });

        setCategories(catsWithCount);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Preloader />;

  // ✅ Helper to navigate to BlogList.jsx with category filter
  const handleCategoryClick = (categoryName) => {
      navigate(`/blogs/list?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-[#7D2596]">
                  <ArrowLeft size={24} />
              </button>
              <h1 className="text-lg font-bold text-gray-600">Category</h1>
              <div className="w-10"></div> 
          </div>
      </div>

      {/* 1. TOP CATEGORIES SLIDER (Purple BG) */}
      <div className="bg-[#7D2596]/10 py-6 relative overflow-hidden">
          {/* Background Decorative Lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 0 Q 50 100 100 0" stroke="#7D2596" fill="none" strokeWidth="2" />
                  <circle cx="90" cy="50" r="40" stroke="#7D2596" fill="none" strokeWidth="1" />
              </svg>
          </div>

          <div className="container mx-auto px-4 flex">
              {/* Vertical Title */}
              <div className="w-8 flex items-center justify-center border-r border-[#7D2596]/20 mr-4">
                  <h2 className="-rotate-90 whitespace-nowrap text-xs font-black text-[#7D2596] tracking-widest uppercase">Top Categories</h2>
              </div>

              {/* Slider */}
              <div className="flex-1 overflow-x-auto scrollbar-hide flex gap-4 snap-x snap-mandatory pb-2" ref={sliderRef}>
                  {categories.slice(0, 5).map((cat) => (
                      <div 
                        key={cat.id} 
                        onClick={() => handleCategoryClick(cat.name)}
                        className="snap-start flex-shrink-0 w-32 h-44 relative rounded-xl overflow-hidden shadow-md group cursor-pointer"
                      >
                          <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-3 left-3">
                              <span className="bg-[#7D2596] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                  {cat.name}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* 2. ALL CATEGORY GRID */}
      <div className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-black text-gray-800 mb-6">All Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, index) => (
                  <div 
                    key={cat.id} 
                    onClick={() => handleCategoryClick(cat.name)}
                    className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-sm group"
                  >
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      
                      <div className="absolute bottom-4 left-4 right-4">
                          <span className={`inline-block text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${
                              index % 3 === 0 ? 'bg-orange-600' : index % 3 === 1 ? 'bg-red-600' : 'bg-blue-600'
                          }`}>
                              {cat.name} <span className="opacity-80">({cat.count})</span>
                          </span>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}