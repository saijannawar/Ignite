import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ✅ Import Service Functions
import { getBlogs, toggleBookmark, getUserBookmarks, getCommentsByBlogId } from '../../../services/blogService';
import { getBlogCategories } from '../../../services/blogCategoryService';
import { ChevronLeft, ChevronRight, Bookmark, ShieldCheck, MessageCircle, User, Clock, PlayCircle, Tag } from 'lucide-react';
import Preloader from '../../../components/common/Preloader';
// ✅ Import Auth
import { useAuth } from '../../../context/AuthContext';
import SEO from '../../../components/common/SEO'; // ✅ Import SEO

export default function BlogHome() {
  const { currentUser } = useAuth(); 
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedBlogIds, setSavedBlogIds] = useState([]); 
  
  // ✅ State to store comment counts: { blogId: count }
  const [commentCounts, setCommentCounts] = useState({});

  // States
  const [activeEditorialIndex, setActiveEditorialIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("Popular"); 

  const sliderRef = useRef(null);
  const categorySliderRef = useRef(null);
  const editorialRef = useRef(null);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetch = async () => {
      try {
        const [blogsData, catsData] = await Promise.all([
          getBlogs(),
          getBlogCategories()
        ]);
        setBlogs(blogsData);
        setCategories(catsData);

        if (currentUser) {
            const ids = await getUserBookmarks(currentUser.uid);
            setSavedBlogIds(ids);
        }

        // ✅ Fetch Comment Counts for all blogs (Async in background)
        const counts = {};
        await Promise.all(blogsData.map(async (blog) => {
            const comments = await getCommentsByBlogId(blog.id);
            counts[blog.id] = comments.length;
        }));
        setCommentCounts(counts);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentUser]); 

  const handleBookmark = async (e, blogId) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!currentUser) {
        alert("Please login to save stories.");
        return navigate('/login');
    }

    const isCurrentlySaved = savedBlogIds.includes(blogId);
    let newSavedIds;
    
    if (isCurrentlySaved) {
        newSavedIds = savedBlogIds.filter(id => id !== blogId);
    } else {
        newSavedIds = [...savedBlogIds, blogId];
    }
    setSavedBlogIds(newSavedIds);

    try {
        await toggleBookmark(currentUser.uid, blogId);
    } catch (error) {
        console.error("Failed to bookmark", error);
        setSavedBlogIds(savedBlogIds); 
    }
  };

  // Scroll Helpers
  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth / 1.5;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };
  
  const handleEditorialScroll = () => {
    if (editorialRef.current) {
      const index = Math.round(editorialRef.current.scrollLeft / editorialRef.current.clientWidth);
      setActiveEditorialIndex(index);
    }
  };

  const scrollToEditorial = (index) => {
    if (editorialRef.current) {
      editorialRef.current.scrollTo({
        left: editorialRef.current.clientWidth * index,
        behavior: 'smooth'
      });
    }
  };

  // Auto-scroll effects
  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        const isEnd = scrollLeft + clientWidth >= scrollWidth - 10; 
        sliderRef.current.scrollTo({ left: isEnd ? 0 : scrollLeft + clientWidth, behavior: 'smooth' });
      }
    }, 4000); 
    return () => clearInterval(interval);
  }, [blogs]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (categorySliderRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categorySliderRef.current;
        const isEnd = scrollLeft + clientWidth >= scrollWidth - 10; 
        categorySliderRef.current.scrollTo({ left: isEnd ? 0 : scrollLeft + 140, behavior: 'smooth' });
      }
    }, 4500); 
    return () => clearInterval(interval);
  }, [categories]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (editorialRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = editorialRef.current;
        const isEnd = scrollLeft + clientWidth >= scrollWidth - 10; 
        const nextPos = isEnd ? 0 : scrollLeft + clientWidth;
        editorialRef.current.scrollTo({ left: nextPos, behavior: 'smooth' });
      }
    }, 6000); 
    return () => clearInterval(interval);
  }, [blogs]);

  if (loading) return <Preloader />;

  // --- DATA LOGIC ---
  const trendingBlogs = blogs.slice(0, 3);
  const markedEditorials = blogs.filter(b => b.isEditorial === true);
  const editorialList = markedEditorials.length > 0 ? markedEditorials : blogs.slice(3, 8);
  const savedBlogsList = blogs.filter(b => savedBlogIds.includes(b.id));
  const forYouBlogs = savedBlogsList.length > 0 ? savedBlogsList : blogs.slice(0, 4);

  const getTabBlogs = () => {
    let sorted = [];
    if (activeTab === "Newest") {
       sorted = [...blogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeTab === "Popular") {
       sorted = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
       sorted = blogs.filter(b => b.isEditorial);
       if(sorted.length === 0) sorted = blogs.slice(0, 5); 
    }
    return sorted.slice(0, 3); 
  };

  const tabBlogs = getTabBlogs();

  const tagColors = [
    "bg-red-600", "bg-green-600", "bg-yellow-500", "bg-pink-500", 
    "bg-cyan-500", "bg-teal-500", "bg-orange-500", "bg-rose-500", 
    "bg-sky-500", "bg-emerald-500", "bg-red-900"
  ];

  return (
    <div className="bg-white min-h-screen font-sans pb-24 md:pb-12">
      
      {/* ✅ Add SEO Metadata */}
      <SEO 
        title="Blog - Latest Tech Trends & Projects" 
        description="Explore the latest in technology, engineering projects, and coding tutorials on Ignite Insights."
        url="/blogs"
      />

      {/* 1. LATEST PROJECTS */}
      <div className="container mx-auto px-4 max-w-7xl pt-2 pb-2">
        <div className="flex items-center justify-between mb-2">
            <div className="relative pl-3">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#7D2596] rounded-full"></div>
              <h1 className="text-lg md:text-2xl font-black text-gray-800 uppercase tracking-wide leading-none">
                Latest <span className="text-[#7D2596]">Projects</span>
              </h1>
            </div>
            
            <div className="flex gap-2 md:hidden">
              <button onClick={() => scroll(sliderRef, 'left')} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full text-[#7D2596]"><ChevronLeft size={14}/></button>
              <button onClick={() => scroll(sliderRef, 'right')} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full text-[#7D2596]"><ChevronRight size={14}/></button>
            </div>
        </div>

        <div className="relative group w-full">
          {blogs.length > 1 && (
            <>
              <button onClick={() => scroll(sliderRef, 'left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-lg text-[#7D2596] rounded-full items-center justify-center hover:bg-[#7D2596] hover:text-white transition-all border border-gray-100"><ChevronLeft size={20} /></button>
              <button onClick={() => scroll(sliderRef, 'right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white shadow-lg text-[#7D2596] rounded-full items-center justify-center hover:bg-[#7D2596] hover:text-white transition-all border border-gray-100"><ChevronRight size={20} /></button>
            </>
          )}

          {blogs.length === 0 ? (
            <div className="h-40 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-bold border-2 border-dashed border-gray-200">No projects yet.</div>
          ) : (
            <div ref={sliderRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth h-52 md:h-96 rounded-xl w-full">
              {blogs.map((blog) => (
                <Link to={`/blogs/${blog.id}`} key={blog.id} className="min-w-full relative snap-center overflow-hidden rounded-xl block group/slide shadow-md">
                  <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/slide:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80"></div>
                  <div className="absolute bottom-0 left-0 w-full p-5 md:p-8">
                    <span className="inline-block bg-[#7D2596] text-white text-[10px] font-bold px-2 py-1 rounded mb-2 uppercase tracking-wide">{blog.category || 'Project'}</span>
                    <h2 className="text-lg md:text-3xl font-extrabold text-white leading-tight line-clamp-2">{blog.title}</h2>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. TOP CATEGORIES (Keep existing code) */}
      <div className="relative py-4 md:py-8 bg-[#7D2596] overflow-hidden mb-2">
         <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
               <path d="M0 100 Q 50 0 100 100" fill="none" stroke="white" strokeWidth="0.5" />
               <circle cx="10" cy="50" r="20" stroke="white" strokeWidth="0.2" fill="none" />
            </svg>
         </div>
         <div className="container mx-auto px-4 max-w-7xl relative z-10">
           <div className="flex items-center h-32 md:h-56">
              <div className="flex-shrink-0 flex items-center justify-center w-8 md:w-16 h-full border-r border-white/20 pr-2">
                 <h2 className="-rotate-90 whitespace-nowrap text-xs md:text-xl font-black text-white uppercase tracking-[0.15em]">Top Categories</h2>
              </div>
              <div className="flex-1 min-w-0 h-full relative pl-4 md:pl-8 flex items-center group">
                 {categories.length === 0 ? <div className="text-white/60 text-sm italic">No categories.</div> : (
                    <div ref={categorySliderRef} className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth items-center h-full w-full">
                      {categories.map((cat) => (
                        <div key={cat.id} className="snap-start flex-shrink-0">
                          <div className="relative w-24 h-28 md:w-40 md:h-48 rounded-md overflow-hidden bg-white shadow-lg border-2 border-white/20 group/cat">
                              {cat.imageUrl ? <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50"><Tag size={20}/></div>}
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-2">
                                <h3 className="text-white font-bold text-[9px] md:text-sm uppercase tracking-wider text-center leading-tight mb-1">{cat.name}</h3>
                              </div>
                          </div>
                        </div>
                      ))}
                    </div>
                 )}
              </div>
           </div>
         </div>
      </div>

      {/* 3. TRENDING NOW */}
      <div className="container mx-auto px-4 max-w-7xl pt-2 pb-2">
         <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg md:text-2xl font-black text-gray-800 tracking-wide">Trending</h2>
            
            {/* ✅ UPDATED LINK: Points to /blogs/trending */}
            <Link to="/blogs/trending" className="text-xs font-bold text-[#7D2596] hover:underline">View All</Link>
         
         </div>
         {trendingBlogs.length === 0 ? <div className="text-gray-400 text-sm italic">No trending posts.</div> : (
            <div className="space-y-3">
               {trendingBlogs.map((blog) => (
                  <Link to={`/blogs/${blog.id}`} key={blog.id} className="block group">
                     <div className="flex items-start gap-3">
                        <div className="w-32 h-20 md:w-48 md:h-28 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
                           <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-w-0">
                           <h3 className="text-sm md:text-lg font-bold text-gray-800 leading-snug mb-1 line-clamp-2 group-hover:text-[#7D2596] transition-colors">{blog.title}</h3>
                           <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase text-gray-500">
                              <span className="px-2 py-0.5 rounded text-white text-[9px] bg-[#7D2596]">{blog.category || 'General'}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                              <span className="text-gray-400">{new Date(blog.createdAt).toLocaleDateString()}</span>
                           </div>
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         )}
      </div>

      {/* 4. EDITORIAL CHOICE */}
      <div className="container mx-auto px-0 md:px-4 max-w-7xl pt-2 pb-2 relative">
         {editorialList.length === 0 ? (
           <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">No editorial choices found.</div>
         ) : (
           <div className="bg-[#1a1a2e] md:rounded-xl overflow-hidden relative text-white w-full">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#7D2596]/20 to-transparent pointer-events-none"></div>
              <div ref={editorialRef} onScroll={handleEditorialScroll} className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth">
                 {editorialList.map((editorialBlog) => {
                    const isSaved = savedBlogIds.includes(editorialBlog.id);
                    return (
                    <div key={editorialBlog.id} className="min-w-full snap-center p-5 md:p-8 flex flex-col items-center text-center">
                         <div className="flex flex-col items-center mb-4">
                            <ShieldCheck size={28} className="text-yellow-400 mb-1" strokeWidth={2.5}/>
                            <h3 className="text-lg font-bold text-white tracking-wide">Editorial Choice</h3>
                         </div>
                         <div className="w-full flex flex-col md:flex-row gap-4 items-start text-left">
                            <div className="relative w-full md:w-48 h-48 md:h-64 flex-shrink-0 rounded-xl overflow-hidden shadow-lg group">
                               <img src={editorialBlog.imageUrl} alt={editorialBlog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                               <button onClick={(e) => handleBookmark(e, editorialBlog.id)} className="absolute top-2 left-2 bg-black/50 hover:bg-[#7D2596] p-2 rounded-full text-white shadow-sm transition-colors z-20">
                                  <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                               </button>
                               <div className="absolute bottom-2 right-2 bg-red-600 p-1.5 rounded-full text-white shadow-sm"><PlayCircle size={16} fill="currentColor" /></div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                               <span className="bg-[#00cca3] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide self-start mb-2">{editorialBlog.category || 'Featured'}</span>
                               <Link to={`/blogs/${editorialBlog.id}`}>
                                  <h2 className="text-xl md:text-2xl font-bold text-white leading-tight mb-3 hover:text-[#7D2596] transition-colors">{editorialBlog.title}</h2>
                               </Link>
                               <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                                  <span className="flex items-center gap-1"><User size={12}/> {editorialBlog.author || 'Admin'}</span>
                                  <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                  <span className="flex items-center gap-1"><Clock size={12}/> {new Date(editorialBlog.createdAt).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </div>
                    </div>
                 )})}
              </div>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                 {editorialList.map((_, idx) => (
                   <button key={idx} onClick={() => scrollToEditorial(idx)} className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${activeEditorialIndex === idx ? 'w-5 bg-yellow-400' : 'w-1.5 bg-gray-600 hover:bg-gray-500'}`}></button>
                 ))}
              </div>
           </div>
         )}
      </div>

      {/* 5. FOR YOU (GRID) (Keep existing) */}
      <div className="container mx-auto px-4 max-w-7xl pt-4 pb-4">
         <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-wide">{savedBlogIds.length > 0 ? "Saved Stories" : "For You"}</h2>
            <Link to="/blogs/saved" className="bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded hover:bg-red-700 transition-colors">View All</Link>
         </div>
         {forYouBlogs.length === 0 ? <div className="text-center py-8 bg-gray-50 rounded-lg text-gray-400 text-sm">No stories found.</div> : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {forYouBlogs.map((blog) => {
                  const isSaved = savedBlogIds.includes(blog.id);
                  return (
                  <Link to={`/blogs/${blog.id}`} key={blog.id} className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                     <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     <button onClick={(e) => handleBookmark(e, blog.id)} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/20 hover:bg-black/50 transition-colors">
                        <Bookmark className="text-white drop-shadow-md" size={18} fill={isSaved ? "currentColor" : "none"} />
                     </button>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                     <div className="absolute bottom-0 left-0 w-full p-3">
                        <span className="text-[#FFC107] text-[10px] font-bold uppercase mb-1 block tracking-wider">{blog.category || 'General'}</span>
                        <h3 className="text-white font-bold text-sm md:text-base leading-tight line-clamp-2 drop-shadow-sm">{blog.title}</h3>
                     </div>
                  </Link>
               )})}
            </div>
         )}
      </div>

      {/* 6. POPULAR LIST (TABS & LIST) */}
      <div className="container mx-auto px-4 max-w-7xl pb-6">
         
         {/* Tabs */}
         <div className="flex items-center gap-2 mb-3 bg-white w-full overflow-x-auto scrollbar-hide">
            {["Newest", "Popular", "Featured"].map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                     activeTab === tab 
                     ? 'bg-[#E63946] text-white shadow-md' 
                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
               >
                  {tab}
               </button>
            ))}
         </div>

         {/* List Items with REAL Comment Count */}
         <div className="flex flex-col gap-3">
            {tabBlogs.length === 0 ? (
               <div className="text-gray-400 text-sm italic py-4">No posts found for {activeTab}.</div>
            ) : (
               tabBlogs.map((blog) => (
                  <Link to={`/blogs/${blog.id}`} key={blog.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all group">
                     
                     <div className="w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-[#E63946] transition-colors relative">
                        <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                     </div>

                     <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-bold text-gray-800 leading-tight mb-1 line-clamp-2 group-hover:text-[#E63946] transition-colors">
                           {blog.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                           <span className="text-[#E63946] uppercase font-bold text-[10px]">{blog.category}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                           {/* ✅ REAL COMMENT COUNT */}
                           <span className="flex items-center gap-1">
                             <MessageCircle size={10} /> 
                             {commentCounts[blog.id] || 0} Comments
                           </span>
                        </div>
                     </div>
                  </Link>
               ))
            )}
         </div>
      </div>

      {/* 7. POPULAR TAGS (Keep existing) */}
      <div className="container mx-auto px-4 max-w-7xl pb-16">
         <h2 className="text-lg font-bold text-gray-800 mb-3">Popular Tags</h2>
         <div className="flex flex-wrap gap-2">
            {categories.map((cat, index) => (
               <Link
                  to={`/blogs/category/${encodeURIComponent(cat.name)}`}
                  key={cat.id}
                  className={`${tagColors[index % tagColors.length]} text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity`}
               >
                  #{cat.name}
               </Link>
            ))}
         </div>
      </div>

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}