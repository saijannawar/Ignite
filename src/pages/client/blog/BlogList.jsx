import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { getBlogs } from '../../../services/blogService';
import { getBlogCategories } from '../../../services/blogCategoryService';
import Preloader from '../../../components/common/Preloader';

export default function BlogList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('All Stories');

  const searchTerm = searchParams.get('search');
  const categoryName = searchParams.get('category');
  const filter = searchParams.get('filter');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const allBlogs = await getBlogs();
        let filtered = allBlogs;

        if (searchTerm) {
            setPageTitle(`Results for "${searchTerm}"`);
            const lower = searchTerm.toLowerCase();
            filtered = allBlogs.filter(b => b.title.toLowerCase().includes(lower));
        } else if (categoryName) {
            setPageTitle(categoryName);
            filtered = allBlogs.filter(b => b.category === categoryName);
        } else if (filter === 'trending') {
            setPageTitle("Trending");
            filtered = allBlogs.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else if (filter === 'saved') {
            setPageTitle("For You");
            filtered = allBlogs.filter(b => b.isEditorial);
        }

        setBlogs(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  if (loading) return <Preloader />;

  return (
    <div className="min-h-screen bg-white font-sans pb-24">
      
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 h-14 flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-[#7D2596]"><ArrowLeft size={22} /></button>
              <h1 className="text-lg font-bold text-gray-800 capitalize">{pageTitle}</h1>
          </div>
      </div>

      {/* LIST CONTENT (Horizontal Cards) */}
      <div className="container mx-auto px-4 py-4">
          {blogs.length === 0 ? (
              <div className="text-center py-20 text-gray-400">No stories found.</div>
          ) : (
              <div className="flex flex-col gap-4">
                  {blogs.map((blog) => (
                      <Link to={`/blogs/${blog.id}`} key={blog.id} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                          
                          {/* Image */}
                          <div className="w-28 h-28 flex-shrink-0 bg-gray-200 rounded-xl overflow-hidden">
                              <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-bold text-[#7D2596] bg-purple-50 px-2 py-0.5 rounded-full uppercase">{blog.category}</span>
                              </div>
                              <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 mb-2">
                                  {blog.title}
                              </h3>
                              {/* Small Description / Excerpt (Stripped HTML) */}
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
                                  {blog.content ? blog.content.replace(/<[^>]*>?/gm, '').substring(0, 80) + '...' : 'No description available.'}
                              </p>
                              
                              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                  <span className="flex items-center gap-1"><User size={10}/> {blog.author || 'Admin'}</span>
                                  <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(blog.createdAt).toLocaleDateString()}</span>
                              </div>
                          </div>
                      </Link>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
}