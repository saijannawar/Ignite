import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, FileText } from 'lucide-react';
import { getBlogs } from '../../../services/blogService';
import Preloader from '../../../components/common/Preloader';

export default function BlogSearch() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allBlogs = await getBlogs();
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = allBlogs.filter(b => 
                b.title.toLowerCase().includes(lowerTerm) || 
                (b.category && b.category.toLowerCase().includes(lowerTerm))
            );
            setBlogs(filtered);
        } else {
            setBlogs([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm]);

  if (loading) return <Preloader />;

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><ArrowLeft size={20} /></button>
              <div className="flex items-center gap-2">
                  <Search size={24} className="text-[#7D2596]" />
                  <h1 className="text-xl font-black text-gray-800">Results for "{searchTerm}"</h1>
              </div>
          </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
          {blogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <FileText size={40} className="text-gray-300" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-700">No stories found</h2>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Try searching for something else.</p>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {blogs.map((blog) => (
                      <div key={blog.id} onClick={() => navigate(`/blogs/${blog.id}`)} className="group cursor-pointer flex flex-col gap-3">
                          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm transition-all duration-300 group-hover:shadow-md">
                              <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#7D2596] text-[10px] font-extrabold uppercase px-2 py-1 rounded shadow-sm">{blog.category}</span>
                          </div>
                          <div>
                              <h3 className="text-base font-bold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#7D2596] transition-colors">{blog.title}</h3>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 font-medium">
                                  <span>{blog.author || 'Admin'}</span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
}