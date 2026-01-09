import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, FileText } from 'lucide-react';
// ✅ Import Service Functions & Auth
import { getBlogs, toggleBookmark, getUserBookmarks } from '../../../services/blogService';
import { useAuth } from '../../../context/AuthContext';
import Preloader from '../../../components/common/Preloader';

export default function BlogForYou() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedBlogIds, setSavedBlogIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch all blogs
        const allBlogs = await getBlogs();
        
        // 2. If user is logged in, fetch their bookmarks
        if (currentUser) {
            const ids = await getUserBookmarks(currentUser.uid);
            setSavedBlogIds(ids);
            
            // 3. Filter to show ONLY saved blogs
            const savedBlogs = allBlogs.filter(blog => ids.includes(blog.id));
            setBlogs(savedBlogs);
        } else {
            // If not logged in, show empty or redirect (Optional: Redirect to login)
            setBlogs([]); 
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  // ✅ Handle Unsave
  const handleBookmark = async (e, blogId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) return;

    // Optimistic UI Update (Remove immediately)
    const newSavedIds = savedBlogIds.filter(id => id !== blogId);
    setSavedBlogIds(newSavedIds);
    setBlogs(prev => prev.filter(b => b.id !== blogId)); // Remove from view immediately

    try {
        await toggleBookmark(currentUser.uid, blogId);
    } catch (error) {
        console.error("Failed to update bookmark", error);
        // Revert (simplified for now, usually you'd re-fetch)
    }
  };

  if (loading) return <Preloader />;

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 h-16 flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600">
                  <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-gray-800">For You</h1>
                  <span className="text-sm font-bold text-gray-400 ml-auto">{blogs.length} Saved</span>
              </div>
          </div>
      </div>

      {/* CONTENT GRID */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
          
          {!currentUser ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <Bookmark size={32} />
                  </div>
                  <h2 className="text-base font-bold text-gray-700">Login to see saved stories</h2>
                  <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-[#7D2596] text-white text-sm font-bold rounded-full">Login Now</button>
              </div>
          ) : blogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <FileText size={32} />
                  </div>
                  <h2 className="text-base font-bold text-gray-700">No saved stories yet</h2>
                  <p className="text-xs text-gray-400 mt-1">Bookmark articles to read them later.</p>
              </div>
          ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {blogs.map((blog) => (
                      <div 
                        key={blog.id} 
                        onClick={() => navigate(`/blogs/${blog.id}`)} 
                        className="relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md group"
                      >
                          <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          
                          {/* ✅ BOOKMARK BUTTON (Filled because it is saved) */}
                          <button 
                             onClick={(e) => handleBookmark(e, blog.id)}
                             className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/30 hover:bg-red-500/80 backdrop-blur-sm transition-colors"
                          >
                             <Bookmark className="text-white" size={18} fill="currentColor" />
                          </button>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                          
                          <div className="absolute bottom-0 left-0 w-full p-4">
                              <span className="text-[#FFC107] text-[10px] font-bold uppercase mb-1 block tracking-wider">
                                  {blog.category || 'General'}
                              </span>
                              <h3 className="text-white font-bold text-sm md:text-base leading-tight line-clamp-3 drop-shadow-sm">
                                  {blog.title}
                              </h3>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
}