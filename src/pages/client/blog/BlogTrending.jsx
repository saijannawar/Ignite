import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react'; // Removed Search import
import { getBlogs } from '../../../services/blogService';
import Preloader from '../../../components/common/Preloader';

export default function BlogTrending() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Colors Map (to match your screenshot style)
  const categoryColors = {
    Sports: "bg-emerald-500",
    Tech: "bg-red-500",
    Fashion: "bg-yellow-500",
    Health: "bg-blue-500",
    World: "bg-purple-500",
    Lifestyle: "bg-orange-500"
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allBlogs = await getBlogs();
        // Sort by Views (Most Popular First)
        const trending = allBlogs.sort((a, b) => (b.views || 0) - (a.views || 0));
        setBlogs(trending);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Preloader />;

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-[#7D2596]">
                  <ArrowLeft size={24} />
              </button>
              <h1 className="text-lg font-bold text-gray-600">Trending</h1>
              {/* ✅ Removed Search Button from here */}
              <div className="w-10"></div> {/* Empty placeholder for balance if needed, or remove div entirely */}
          </div>
      </div>

      {/* CONTENT LIST */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
          
          <div className="flex justify-between items-baseline mb-6">
              <h2 className="text-2xl font-black text-gray-900">Trending</h2>
              <span className="text-sm font-bold text-gray-400">{blogs.length} Posts</span>
          </div>

          <div className="space-y-4">
              {blogs.map((blog) => (
                  <div 
                    key={blog.id} 
                    onClick={() => navigate(`/blogs/${blog.id}`)}
                    className="flex gap-4 p-3 bg-blue-50/50 rounded-3xl cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                      {/* Image Thumbnail (Left) */}
                      <div className="w-28 h-28 flex-shrink-0 bg-gray-200 rounded-2xl overflow-hidden shadow-sm relative">
                          <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                      </div>

                      {/* Content (Right) */}
                      <div className="flex-1 py-1 flex flex-col justify-center">
                          <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 mb-3">
                              {blog.title}
                          </h3>
                          
                          <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold text-white px-3 py-1 rounded-full ${categoryColors[blog.category] || 'bg-gray-500'}`}>
                                  {blog.category || 'General'}
                              </span>
                              <span className="text-xs font-bold text-gray-400">
                                  {new Date(blog.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                              </span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

    </div>
  );
}