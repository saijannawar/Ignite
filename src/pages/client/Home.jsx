import React, { useEffect, useState, useRef } from 'react';
import { getBanners, getHomeSlides } from '../../services/productService'; 
import { getCategories } from '../../services/categoryService';
import { getProducts } from '../../services/productService';
import { ChevronLeft, ChevronRight, Loader, Truck, ArrowRight, Star } from 'lucide-react'; // Added Star for reference
import { Link } from 'react-router-dom';

import ClientProductCard from '../../components/client/ClientProductCard'; 

export default function Home() {
  const [heroSlides, setHeroSlides] = useState([]); 
  const [homeList1Banners, setHomeList1Banners] = useState([]); 
  const [homeList2Banners, setHomeList2Banners] = useState([]); 

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]); 
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); 

  // Refs for scrolling
  const productContainerRef = useRef(null);
  const bannerContainerRef = useRef(null);
  const latestProductsRef = useRef(null); 
  const bannerList2Ref = useRef(null); 

  // --- 1. FETCH DATA & CALCULATE RATINGS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slidesData, list1Data, list2Data, categoryData, productData] = await Promise.all([
          getHomeSlides(),      
          getBanners('home_1'), 
          getBanners('home_2'), 
          getCategories(),
          getProducts()
        ]);
        
        setHeroSlides(slidesData); 
        setHomeList1Banners(list1Data); 
        setHomeList2Banners(list2Data); 
        setCategories(categoryData);

        // --- CALCULATE AVERAGE RATINGS HERE ---
        const productsWithRatings = productData.map((product) => {
          const reviews = product.reviews || []; // Ensure reviews array exists
          const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
          const averageRating = reviews.length > 0 ? (totalRating / reviews.length) : 0;
          
          return {
            ...product,
            // Add these new properties to your product object
            averageRating: parseFloat(averageRating.toFixed(1)), 
            reviewCount: reviews.length
          };
        });

        setProducts(productsWithRatings);
        setFilteredProducts(productsWithRatings);
        setLatestProducts(productsWithRatings.slice(0, 10)); 

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. FILTER LOGIC ---
  useEffect(() => {
    if (activeTab === 'ALL') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => p.category === activeTab || p.categoryId === activeTab);
      setFilteredProducts(filtered);
    }
  }, [activeTab, products]);

  // --- 3. AUTO-SLIDE HERO ---
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));

  // --- 4. SCROLL HANDLER ---
  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const cardWidth = 280; 
      const gap = 24; 
      const scrollAmount = cardWidth + gap;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center"><Loader className="animate-spin text-[#ff4d4d]" /></div>;

  return (
    <div className="w-full min-h-screen font-sans">
      
      {/* ========================================================= */}
      {/* TOP SECTION: GREY BACKGROUND (Slider + Categories) */}
      {/* ========================================================= */}
      <div className="bg-[#E6E6FA] pb-10 pt-6"> 
        
        {/* 1. HERO SLIDER */}
        <div className="container mx-auto px-4 mb-12">
          <div className="relative w-full h-[200px] sm:h-[300px] md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden shadow-sm bg-white group">
            {heroSlides.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                 <p className="text-lg font-medium">No Home Slides Available</p>
              </div>
            ) : (
              heroSlides.map((slide, index) => (
                <div key={slide.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  <img src={slide.imageUrl || slide.image} alt="Home Slide" className="w-full h-full object-cover object-center" />
                </div>
              ))
            )}
            {heroSlides.length > 1 && (
              <>
                <button onClick={prevSlide} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white text-black p-3 rounded-full backdrop-blur-sm transition-all shadow-md"><ChevronLeft size={24} /></button>
                <button onClick={nextSlide} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white text-black p-3 rounded-full backdrop-blur-sm transition-all shadow-md"><ChevronRight size={24} /></button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {heroSlides.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-[#ff4d4d] w-6' : 'bg-white/60 hover:bg-white'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. CATEGORIES */}
        <div className="container mx-auto px-4">
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide justify-start lg:justify-center">
              {categories.map((cat) => (
                  <Link 
                    to={`/shop?category=${cat.id}`} 
                    key={cat.id} 
                    className="group min-w-[140px] w-[140px] h-[180px] flex flex-col items-center justify-between bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-[#ff4d4d]/30 transition-all duration-300 cursor-pointer p-4"
                  >
                    <div className="w-20 h-20 flex items-center justify-center flex-grow">
                      <img src={cat.imageUrl} alt={cat.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="h-[40px] flex items-center justify-center w-full">
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-[#ff4d4d] text-center line-clamp-2 leading-tight break-words w-full">
                            {cat.name}
                        </span>
                    </div>
                  </Link>
                ))}
            </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM SECTION: WHITE BACKGROUND (Products & Banners) */}
      {/* ========================================================= */}
      <div className="bg-white pt-10 pb-20">
        
        {/* 3. POPULAR PRODUCTS */}
        <div className="container mx-auto px-4 mb-6 relative group/slider">
          <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-0 mb-8">
            <div className="mb-4 md:mb-0 pb-2">
              <h2 className="text-2xl font-bold text-gray-800">Popular Products</h2>
              <p className="text-sm text-gray-500 mt-1">Do not miss the current offers until the end of March.</p>
            </div>
            <div className="flex gap-8 overflow-x-auto pb-0 scrollbar-hide w-full md:w-auto">
                <button onClick={() => setActiveTab('ALL')} className={`whitespace-nowrap pb-3 text-sm font-bold uppercase transition-all border-b-[3px] ${activeTab === 'ALL' ? 'text-[#ff4d4d] border-[#ff4d4d]' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>ALL</button>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => setActiveTab(cat.id)} className={`whitespace-nowrap pb-3 text-sm font-bold uppercase transition-all border-b-[3px] ${activeTab === cat.id ? 'text-[#ff4d4d] border-[#ff4d4d]' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>{cat.name}</button>
                ))}
            </div>
          </div>
          <div className="relative">
            <button onClick={() => scrollContainer(productContainerRef, 'left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#ff4d4d] hover:text-white hover:border-[#ff4d4d] transition-all opacity-0 group-hover/slider:opacity-100"><ChevronLeft size={24} /></button>
            <button onClick={() => scrollContainer(productContainerRef, 'right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#ff4d4d] hover:text-white hover:border-[#ff4d4d] transition-all opacity-0 group-hover/slider:opacity-100"><ChevronRight size={24} /></button>
            
            {/* PRODUCT CARDS */}
            <div ref={productContainerRef} className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide scroll-smooth snap-x snap-mandatory px-1">
              {filteredProducts.map((product) => (
                <div key={product.id} className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-center h-full">
                  {/* We pass the product (which now includes averageRating) to the card */}
                  <ClientProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. FREE SHIPPING & BANNER LIST 1 */}
        <div className="container mx-auto max-w-7xl mt-2 space-y-8 mb-16">
          <div className="w-full bg-white border border-[#ff4d4d] rounded-lg p-6 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#ff4d4d]"></div>
            <div className="flex items-center gap-6 z-10">
              <Truck size={48} className="text-[#333]" strokeWidth={1.5} />
              <div>
                <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wide">Free Shipping</h3>
                <p className="text-sm text-gray-500 mt-1">Free Delivery Now On Your First Order and over ₹200</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0 z-10"><span className="text-2xl font-bold text-gray-800">- Only ₹200*</span></div>
          </div>

          {homeList1Banners.length > 0 && (
            <div className="relative group/bannerSlider">
              <button onClick={() => scrollContainer(bannerContainerRef, 'left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#ff4d4d] hover:text-white hover:border-[#ff4d4d] transition-all opacity-0 group-hover/bannerSlider:opacity-100"><ChevronLeft size={24} /></button>
              <button onClick={() => scrollContainer(bannerContainerRef, 'right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#ff4d4d] hover:text-white hover:border-[#ff4d4d] transition-all opacity-0 group-hover/bannerSlider:opacity-100"><ChevronRight size={24} /></button>
              <div ref={bannerContainerRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory">
                {homeList1Banners.map((banner) => (
                  <div key={banner.id} className="min-w-[320px] md:min-w-[380px] h-[220px] flex-shrink-0 snap-center relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group bg-white border border-gray-100">
                    <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className={`absolute inset-0 p-6 flex flex-col justify-center z-10 ${banner.alignInfo === 'Right' ? 'items-end text-right' : 'items-start text-left'}`}>
                      {banner.category && <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 shadow-sm">{banner.category}</span>}
                      <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-2 max-w-[70%] drop-shadow-sm line-clamp-2">{banner.title}</h3>
                      {banner.price && <div className="text-lg font-bold text-[#ff4d4d] mb-4">₹{banner.price}</div>}
                      <button className="flex items-center gap-2 text-xs font-bold uppercase border-b-2 border-gray-800 pb-1 hover:text-[#ff4d4d] hover:border-[#ff4d4d] transition-colors">Shop Now <ArrowRight size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. LATEST PRODUCTS */}
        <div className="container mx-auto px-4 mb-6 relative group/latest">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Latest Products</h2>
            <Link to="/shop" className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-white hover:bg-[#ff4d4d] transition-all bg-gray-100 px-5 py-2.5 rounded-full shadow-sm">View All <ArrowRight size={16} /></Link>
          </div>
          <div className="relative">
            <button onClick={() => scrollContainer(latestProductsRef, 'left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#ff4d4d] hover:text-white hover:border-[#ff4d4d] transition-all opacity-0 group-hover/latest:opacity-100"><ChevronLeft size={24} /></button>
            <button onClick={() => scrollContainer(latestProductsRef, 'right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#ff4d4d] hover:text-white hover:border-[#ff4d4d] transition-all opacity-0 group-hover/latest:opacity-100"><ChevronRight size={24} /></button>
            <div ref={latestProductsRef} className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide scroll-smooth snap-x snap-mandatory px-1">
              {latestProducts.length === 0 ? <div className="w-full py-10 text-center text-gray-400">No recent products available.</div> : 
                latestProducts.map((product) => (<div key={product.id} className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-center h-full"><ClientProductCard product={product} /></div>))}
            </div>
          </div>
        </div>

        {/* 6. HOME BANNER LIST 2 */}
        {homeList2Banners.length > 0 && (
          <div className="container mx-auto px-4 mb-16 relative group/bannerList2">
            <div className="relative">
              <button onClick={() => scrollContainer(bannerList2Ref, 'left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#ff4d4d] hover:text-white hover:border-[#ff4d4d] transition-all opacity-0 group-hover/bannerList2:opacity-100"><ChevronLeft size={24} /></button>
              <button onClick={() => scrollContainer(bannerList2Ref, 'right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#ff4d4d] hover:text-white hover:border-[#ff4d4d] transition-all opacity-0 group-hover/bannerList2:opacity-100"><ChevronRight size={24} /></button>
              <div ref={bannerList2Ref} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory">
                {homeList2Banners.map((banner) => (
                  <div key={banner.id} className="min-w-[280px] md:min-w-[350px] h-[180px] flex-shrink-0 snap-center relative rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all group bg-white border border-gray-100 cursor-pointer">
                    <img src={banner.imageUrl} alt="Promo" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}