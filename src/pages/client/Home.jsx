import React, { useEffect, useState, useRef } from 'react';
import { getBanners } from '../../services/productService'; 
import { getCategories } from '../../services/categoryService';
import { getProducts } from '../../services/productService';
import { db } from '../../config/firebase'; 
import { collection, getDocs } from 'firebase/firestore'; 
import { ChevronLeft, ChevronRight, Loader, Truck, ArrowRight, MapPin } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import ProductCard from '../../components/client/ProductCard'; 
import SEO from '../../components/common/SEO'; // ✅ Import SEO Component

export default function Home() {
  const [heroSlides, setHeroSlides] = useState([]); 
  const [homeList1Banners, setHomeList1Banners] = useState([]); 
  const [homeList2Banners, setHomeList2Banners] = useState([]); 

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]); 
  const [latestProducts, setLatestProducts] = useState([]); 
  
  const [categoryProductRows, setCategoryProductRows] = useState([]);

  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Split loading states to prioritize LCP (Hero) rendering
  const [heroLoading, setHeroLoading] = useState(true); 
  const [contentLoading, setContentLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('ALL'); 

  const productContainerRef = useRef(null);
  const bannerContainerRef = useRef(null);
  const latestProductsRef = useRef(null); 
  const bannerList2Ref = useRef(null); 
  
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch Hero Slides IMMEDIATELY (Critical for LCP)
    const fetchHero = async () => {
      try {
        const slideSnap = await getDocs(collection(db, "home_banners"));
        const slidesData = slideSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        setHeroSlides(slidesData);
      } catch (err) {
        console.error("Hero fetch error:", err);
      } finally {
        setHeroLoading(false); // Render hero as soon as possible
      }
    };

    // 2. Fetch Heavy Data (Products/Cats) Separately
    const fetchRestContent = async () => {
      try {
        const [allBanners, categoryData, productData] = await Promise.all([
          getBanners('home_banner'), 
          getCategories(),
          getProducts()
        ]);

        if (allBanners && allBanners.length > 0) {
            const topBanners = allBanners.filter(b => b.position === 'top' || !b.position);
            const bottomBanners = allBanners.filter(b => b.position === 'bottom');
            setHomeList1Banners(topBanners);
            setHomeList2Banners(bottomBanners);
        }

        if (categoryData && categoryData.length > 0) {
            categoryData.sort((a, b) => (a.order || 0) - (b.order || 0));
        }
        setCategories(categoryData);

        const formattedProducts = productData.map((p) => {
          const reviewsList = Array.isArray(p.reviews) ? p.reviews : [];
          const reviewCount = reviewsList.length;
          const avg = reviewCount > 0 ? reviewsList.reduce((sum, r) => sum + (Number(r.rating)||0), 0) / reviewCount : (Number(p.rating)||0);
          return {
            ...p,
            originalPrice: p.originalPrice || Math.round(p.price * 1.2), 
            brand: p.brand || "Ignite", 
            rating: parseFloat(avg.toFixed(1)), 
            reviews: reviewCount,
            img: p.imageUrl || (p.images && p.images[0]) || p.img || 'https://via.placeholder.com/300'
          };
        });

        const popularSorted = [...formattedProducts].sort((a, b) => b.reviews - a.reviews);
        setProducts(popularSorted);
        setFilteredProducts(popularSorted); 
        setLatestProducts(formattedProducts.slice(0, 10)); 

        const catCounts = {};
        formattedProducts.forEach(p => {
            if(p.category) catCounts[p.category] = (catCounts[p.category] || 0) + 1;
        });

        const sortedCategories = [...categoryData].sort((a, b) => {
            const countA = catCounts[a.id] || 0;
            const countB = catCounts[b.id] || 0;
            return countB - countA;
        });

        const top5Cats = sortedCategories.slice(0, 5);
        const catRows = top5Cats.map(cat => {
            const matchingProducts = formattedProducts.filter(p => p.category === cat.id);
            return { category: cat, products: matchingProducts.slice(0, 10) };
        }).filter(row => row.products.length > 0);

        setCategoryProductRows(catRows);

      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setContentLoading(false);
      }
    };

    fetchHero();
    fetchRestContent();
  }, []);

  useEffect(() => {
    if (activeTab === 'ALL') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === activeTab));
    }
  }, [activeTab, products]);

  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const cardWidth = 280; 
      const gap = 24; 
      const scrollAmount = cardWidth + gap;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollCategoryRow = (id, direction) => {
    const container = document.getElementById(`cat-row-${id}`);
    if (container) {
        const scrollAmount = 300;
        container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleBannerClick = (banner) => {
    const catIdentifier = banner.categoryId || banner.category || 'All';
    navigate(`/shop?category=${catIdentifier}`);
  };

  return (
    <div className="w-full min-h-screen font-sans">
      
      {/* ✅ SEO TAGS ADDED */}
      <SEO 
        title="Ignite - Best Robotics & IoT Shop" 
        description="Welcome to Ignite Insights. We provide the best engineering components and project guidance in Pune."
        url="/"
      />

      {/* --- HERO SECTION (LCP PRIORITY) --- */}
      <div className="bg-[#f3e8ff] pb-4 pt-4"> 
        <div className="container mx-auto px-4 mb-4"> 
          <div className="relative w-full h-[200px] sm:h-[300px] md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden shadow-sm bg-white group">
            
            {/* HERO SKELETON: Show this immediately while fetching slides to prevent CLS */}
            {heroLoading && (
               <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                  <span className="sr-only">Loading slider...</span>
               </div>
            )}

            {!heroLoading && heroSlides.length === 0 && (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400"><p>No Home Slides Available</p></div>
            )}

            {!heroLoading && heroSlides.map((slide, index) => (
                <div key={slide.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                  {/* LCP OPTIMIZATION: fetchPriority="high" on the first image */}
                  <img 
                    src={slide.imageUrl || slide.image} 
                    alt="Home Slide" 
                    className="w-full h-full object-cover object-center" 
                    fetchPriority={index === 0 ? "high" : "auto"} 
                    loading={index === 0 ? "eager" : "lazy"} 
                    decoding="async"
                  />
                </div>
            ))}

            {!heroLoading && heroSlides.length > 1 && (
              <>
                <button onClick={prevSlide} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white text-black p-3 rounded-full backdrop-blur-sm transition-all shadow-md"><ChevronLeft size={24} /></button>
                <button onClick={nextSlide} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white text-black p-3 rounded-full backdrop-blur-sm transition-all shadow-md"><ChevronRight size={24} /></button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {heroSlides.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-[#7D2596] w-6' : 'bg-white/60 hover:bg-white'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CATEGORIES (Part of Top Fold) */}
        <div className="container mx-auto px-4">
            {contentLoading ? (
                // Category Skeleton
                <div className="flex gap-4 overflow-x-hidden">
                    {[1,2,3,4,5].map(i => <div key={i} className="min-w-[140px] h-[180px] bg-white/50 rounded-xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-start lg:justify-center"> 
                {categories.map((cat) => (
                    <Link to={`/shop?category=${cat.id}`} key={cat.id} className="group min-w-[140px] w-[140px] h-[180px] flex flex-col items-center justify-between bg-white border border-purple-100 rounded-xl hover:shadow-lg hover:border-[#7D2596]/30 transition-all duration-300 cursor-pointer p-4">
                        <div className="w-20 h-20 flex items-center justify-center flex-grow">
                        <img src={cat.imageUrl} alt={cat.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                        </div>
                        <div className="h-[40px] flex items-center justify-center w-full">
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-[#7D2596] text-center line-clamp-2 leading-tight break-words w-full">{cat.name}</span>
                        </div>
                    </Link>
                    ))}
                </div>
            )}
        </div>
      </div>

      <div className="bg-white pt-4 pb-10"> 
        
        {/* --- CONTENT LOADING SKELETON (BELOW FOLD) --- */}
        {contentLoading ? (
            <div className="container mx-auto px-4 py-10 flex justify-center">
                <Loader className="animate-spin text-[#7D2596]" />
            </div>
        ) : (
            <>
                {/* POPULAR PRODUCTS */}
                <div className="container mx-auto px-4 mb-10 relative group/slider"> 
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-2 mb-4 gap-4"> 
                    <div className="flex-shrink-0 md:mr-4">
                    <h2 className="text-2xl font-bold text-gray-800">Popular Products</h2>
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden w-full">
                        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide w-full items-center">
                            <button onClick={() => setActiveTab('ALL')} className={`whitespace-nowrap pb-1 text-sm font-bold uppercase transition-all border-b-[3px] ${activeTab === 'ALL' ? 'text-[#7D2596] border-[#7D2596]' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>ALL</button>
                            {categories.map((cat) => (
                            <button key={cat.id} onClick={() => setActiveTab(cat.id)} className={`whitespace-nowrap pb-1 text-sm font-bold uppercase transition-all border-b-[3px] ${activeTab === cat.id ? 'text-[#7D2596] border-[#7D2596]' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>{cat.name}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button onClick={() => scrollContainer(productContainerRef, 'left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#7D2596] hover:text-white hover:border-[#7D2596] transition-all opacity-0 group-hover/slider:opacity-100"><ChevronLeft size={24} /></button>
                    <button onClick={() => scrollContainer(productContainerRef, 'right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#7D2596] hover:text-white hover:border-[#7D2596] transition-all opacity-0 group-hover/slider:opacity-100"><ChevronRight size={24} /></button>
                    
                    <div ref={productContainerRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory px-1"> 
                    {filteredProducts.map((product) => (
                        <div key={product.id} className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-center h-full">
                        <ProductCard product={product} />
                        </div>
                    ))}
                    </div>
                </div>
                </div>

                {/* SHIPPING INFO & BANNER LIST 1 */}
                <div className="container mx-auto px-4 max-w-7xl mt-0 space-y-4 mb-10">
                <div className="w-full bg-white border-l-4 border-[#7D2596] rounded-r-lg p-4 flex flex-col md:flex-row items-center justify-between shadow-sm bg-purple-50/20">
                    <div className="flex items-center gap-4">
                        <div className="bg-white p-2.5 rounded-full shadow-sm text-[#7D2596] border border-purple-100">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">
                                Pune Delivery & Campus Pickup
                            </h3>
                            <p className="text-xs text-gray-600 mt-0.5">
                                <span className="font-bold text-[#7D2596]">FREE</span> Pickup at VIT Campus • Fast Shipping across Pune
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 md:mt-0 flex gap-4 text-xs font-bold text-gray-500">
                        <div className="flex items-center gap-1"><Truck size={14} className="text-[#7D2596]"/> 24h Dispatch</div>
                        <div className="flex items-center gap-1"><MapPin size={14} className="text-[#7D2596]"/> VIT Pune</div>
                    </div>
                </div>

                {/* LIST 1: Shows Top Banners */}
                {homeList1Banners.length > 0 && (
                    <div className="relative group/bannerSlider">
                    <button onClick={() => scrollContainer(bannerContainerRef, 'left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#7D2596] hover:text-white hover:border-[#7D2596] transition-all opacity-0 group-hover/bannerSlider:opacity-100"><ChevronLeft size={24} /></button>
                    <button onClick={() => scrollContainer(bannerContainerRef, 'right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#7D2596] hover:text-white hover:border-[#7D2596] transition-all opacity-0 group-hover/bannerSlider:opacity-100"><ChevronRight size={24} /></button>
                    
                    <div ref={bannerContainerRef} className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide scroll-smooth snap-x snap-mandatory">
                        {homeList1Banners.map((banner) => (
                        <div key={banner.id} className="min-w-[300px] md:min-w-[360px] h-[180px] flex-shrink-0 snap-center relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group bg-white border border-gray-100">
                            <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy"/>
                            <div className={`absolute inset-0 p-4 flex flex-col justify-center z-10 ${banner.alignInfo === 'Right' ? 'items-end text-right' : 'items-start text-left'}`}>
                            {banner.category && <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 shadow-sm">{banner.category}</span>}
                            <h3 className="text-lg font-extrabold text-gray-900 leading-tight mb-2 max-w-[70%] drop-shadow-sm line-clamp-2">{banner.title}</h3>
                            {banner.price && <div className="text-base font-bold text-[#7D2596] mb-3">₹{banner.price}</div>}
                            <button 
                                onClick={() => handleBannerClick(banner)}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase border-b-2 border-gray-800 pb-1 hover:text-[#7D2596] hover:border-[#7D2596] transition-colors"
                            >
                                Shop Now <ArrowRight size={12} />
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                )}
                </div>

                {/* LATEST PRODUCTS */}
                <div className="container mx-auto px-4 mb-10 relative group/latest">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Latest Products</h2>
                    <Link to="/shop" className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-white hover:bg-[#7D2596] transition-all bg-gray-100 px-5 py-2 rounded-full shadow-sm">View All <ArrowRight size={16} /></Link>
                </div>
                <div className="relative">
                    <button onClick={() => scrollContainer(latestProductsRef, 'left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#7D2596] hover:text-white hover:border-[#7D2596] transition-all opacity-0 group-hover/latest:opacity-100"><ChevronLeft size={24} /></button>
                    <button onClick={() => scrollContainer(latestProductsRef, 'right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#7D2596] hover:text-white hover:border-[#7D2596] transition-all opacity-0 group-hover/latest:opacity-100"><ChevronRight size={24} /></button>
                    <div ref={latestProductsRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory px-1">
                    {latestProducts.length === 0 ? <div className="w-full py-10 text-center text-gray-400">No recent products available.</div> : latestProducts.map((product) => (<div key={product.id} className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-center h-full"><ProductCard product={product} /></div>))}
                    </div>
                </div>
                </div>

                {/* TOP 5 CATEGORY ROWS */}
                <div className="container mx-auto px-4 space-y-10 mb-10">
                    {categoryProductRows.map((row) => (
                        <div key={row.category.id} className="relative group/catRow">
                            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                                <h2 className="text-xl font-bold text-gray-800">{row.category.name}</h2>
                                <Link to={`/shop?category=${row.category.id}`} className="text-sm font-bold text-[#7D2596] hover:underline flex items-center gap-1">
                                    See All <ArrowRight size={14} />
                                </Link>
                            </div>
                            
                            <div className="relative">
                                <button onClick={() => scrollCategoryRow(row.category.id, 'left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md items-center justify-center text-gray-600 hover:bg-[#7D2596] hover:text-white transition-all opacity-0 group-hover/catRow:opacity-100">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={() => scrollCategoryRow(row.category.id, 'right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-md items-center justify-center text-gray-600 hover:bg-[#7D2596] hover:text-white transition-all opacity-0 group-hover/catRow:opacity-100">
                                    <ChevronRight size={20} />
                                </button>

                                <div id={`cat-row-${row.category.id}`} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory px-1">
                                    {row.products.map((product) => (
                                        <div key={product.id} className="min-w-[260px] max-w-[260px] flex-shrink-0 snap-center h-full">
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* LIST 2: Shows Bottom Banners */}
                {homeList2Banners.length > 0 && (
                <div className="container mx-auto px-4 max-w-7xl mb-6 relative group/bannerList2">
                    <div className="relative">
                    <button onClick={() => scrollContainer(bannerList2Ref, 'left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#7D2596] hover:text-white hover:border-[#7D2596] transition-all opacity-0 group-hover/bannerList2:opacity-100"><ChevronLeft size={24} /></button>
                    <button onClick={() => scrollContainer(bannerList2Ref, 'right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white border border-gray-200 rounded-full shadow-lg items-center justify-center text-gray-600 hover:bg-[#7D2596] hover:text-white hover:border-[#7D2596] transition-all opacity-0 group-hover/bannerList2:opacity-100"><ChevronRight size={24} /></button>
                    
                    <div ref={bannerList2Ref} className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide scroll-smooth snap-x snap-mandatory">
                        {homeList2Banners.map((banner) => (
                        <div 
                            key={banner.id} 
                            onClick={() => handleBannerClick(banner)}
                            className="min-w-[280px] md:min-w-[350px] h-[180px] flex-shrink-0 snap-center relative rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all group bg-white border border-gray-100 cursor-pointer"
                        >
                            <img src={banner.imageUrl} alt="Promo" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                        </div>
                        ))}
                    </div>
                    </div>
                </div>
                )}
            </>
        )}
      </div>

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}