import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    getBlogById, 
    getBlogs, 
    toggleBookmark, 
    getUserBookmarks,
    addComment,
    getCommentsByBlogId,
    incrementBlogView 
} from '../../../services/blogService';
import { useAuth } from '../../../context/AuthContext';
import Preloader from '../../../components/common/Preloader';
import { 
    ArrowLeft, Share2, MessageCircle, 
    Heart, Eye, Bookmark, Send, MoreHorizontal, Clock, User 
} from 'lucide-react';
import SEO from '../../../components/common/SEO'; // ✅ Import SEO Component

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const hasIncremented = useRef(false);

  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const blogData = await getBlogById(id);
        
        const viewedKey = `viewed_${id}`;
        const alreadyViewed = sessionStorage.getItem(viewedKey);

        if (!alreadyViewed && !hasIncremented.current) {
            hasIncremented.current = true; 
            await incrementBlogView(id);
            sessionStorage.setItem(viewedKey, 'true');
            if (blogData) {
                blogData.views = (blogData.views || 0) + 1;
            }
        }

        setBlog(blogData);

        if (blogData) {
            const allBlogs = await getBlogs();
            const related = allBlogs
                .filter(b => b.category === blogData.category && b.id !== id)
                .slice(0, 3);
            setRelatedBlogs(related);

            const blogComments = await getCommentsByBlogId(id);
            setComments(blogComments);
        }

        if (currentUser) {
            const bookmarks = await getUserBookmarks(currentUser.uid);
            setIsSaved(bookmarks.includes(id));
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  const handleBookmark = async () => {
      if (!currentUser) return navigate('/login');
      setIsSaved(!isSaved); 
      try {
          await toggleBookmark(currentUser.uid, id);
      } catch (err) {
          setIsSaved(!isSaved);
      }
  };

  const handleShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: blog.title,
                  url: window.location.href,
              });
          } catch (error) { console.log(error); }
      } else {
          navigator.clipboard.writeText(window.location.href);
          alert("Link copied!");
      }
  };

  const handlePostComment = async (e) => {
      e.preventDefault();
      if (!currentUser) return navigate('/login');
      if (!newComment.trim()) return;

      setSubmitting(true);
      try {
          await addComment(id, currentUser, newComment);
          setComments([{
              id: Date.now(),
              userId: currentUser.uid,
              userName: currentUser.displayName || currentUser.email.split('@')[0],
              userAvatar: currentUser.photoURL,
              text: newComment,
              createdAt: new Date().toISOString()
          }, ...comments]);
          setNewComment("");
      } catch (err) {
          alert("Failed to post comment.");
      } finally {
          setSubmitting(false);
      }
  };

  if (loading) return <Preloader />;
  if (!blog) return <div className="text-center py-20 font-bold text-gray-500">Blog not found.</div>;

  // Helper to strip HTML tags for description
  const cleanDescription = blog.content ? blog.content.replace(/<[^>]+>/g, '').substring(0, 160) + '...' : '';

  return (
    <div className="bg-white min-h-screen font-sans pb-24">
      
      {/* ✅ Dynamic SEO for Blog Post */}
      <SEO 
        title={blog.title} 
        description={cleanDescription}
        image={blog.imageUrl}
        url={`/blogs/${id}`}
        type="article"
      />

      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-3xl">
              <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-700 transition-colors">
                  <ArrowLeft size={22} />
              </button>
              <h1 className="text-sm font-bold text-gray-800 uppercase tracking-widest opacity-80">Article</h1>
              <button onClick={handleShare} className="p-2 -mr-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                  <Share2 size={22} />
              </button>
          </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl mt-6">
          
          {/* HERO IMAGE */}
          <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-xl mb-6 group">
              <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

              <button 
                  onClick={handleBookmark} 
                  className={`absolute top-4 right-4 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-lg hover:bg-white hover:text-red-500 transition-all active:scale-95 ${isSaved ? 'bg-red-500 text-white border-transparent' : ''}`}
              >
                  <Bookmark size={20} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-white" : ""} />
              </button>

              <span className="absolute bottom-4 left-4 bg-[#7D2596] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                  {blog.category}
              </span>
          </div>

          {/* TITLE & META */}
          <div className="mb-8">
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                  {blog.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
                  {/* Author Name */}
                  <div className="flex items-center gap-1.5 text-gray-600">
                      <User size={14} className="text-[#7D2596]" />
                      <span>{blog.author || 'Ignite Team'}</span>
                  </div>

                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-300"></span>

                  <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#7D2596]" />
                      <span>{new Date(blog.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  
                  <div className="flex items-center gap-1.5">
                      <Eye size={14} className="text-[#7D2596]" />
                      <span>{blog.views || 0} Views</span>
                  </div>
              </div>
          </div>

          {/* CONTENT */}
          <div 
              className="prose prose-lg prose-gray max-w-none text-gray-700 leading-relaxed font-medium mb-10"
              dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <hr className="border-gray-100 mb-10" />

          {/* RELATED POSTS */}
          <div className="mb-10">
              <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-black text-gray-900">Related Posts</h3>
                  <Link to="/blogs" className="text-xs font-bold text-[#7D2596] hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                  {relatedBlogs.map(rb => (
                      <Link to={`/blogs/${rb.id}`} key={rb.id} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all group">
                          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                              <img src={rb.imageUrl} alt={rb.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                          </div>
                          <div className="flex-1 py-1 flex flex-col justify-center">
                              <h4 className="font-bold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-[#7D2596] transition-colors">{rb.title}</h4>
                              <div className="flex items-center gap-2">
                                  <span className="bg-purple-50 text-[#7D2596] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">{rb.category}</span>
                                  <span className="text-[10px] text-gray-400 font-bold">{new Date(rb.createdAt).toLocaleDateString()}</span>
                              </div>
                          </div>
                      </Link>
                  ))}
                  {relatedBlogs.length === 0 && <p className="text-sm text-gray-400 italic">No related posts found.</p>}
              </div>
          </div>

          {/* COMMENTS */}
          <div className="bg-gray-50/80 rounded-3xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-gray-900">{comments.length} Comments</h3>
                  <button className="p-1 rounded-full hover:bg-gray-200 transition-colors"><MoreHorizontal size={20} className="text-gray-400"/></button>
              </div>

              <form onSubmit={handlePostComment} className="mb-8 relative bg-white rounded-2xl p-2 shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-[#7D2596]/20 transition-all">
                  <textarea 
                      className="w-full bg-transparent border-none outline-none p-3 text-sm text-gray-700 placeholder-gray-400 resize-none h-24"
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end px-2 pb-1">
                      <button 
                          type="submit" 
                          disabled={submitting || !newComment.trim()}
                          className="bg-[#7D2596] text-white disabled:bg-gray-300 disabled:text-gray-500 font-bold text-xs flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:shadow-md active:scale-95"
                      >
                          Post <Send size={12} />
                      </button>
                  </div>
              </form>

              <div className="space-y-6">
                  {comments.map(comment => (
                      <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden shadow-sm border border-white">
                              {comment.userAvatar ? (
                                  <img src={comment.userAvatar} alt="" className="w-full h-full object-cover"/>
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-purple-100 text-[#7D2596] font-bold text-sm">
                                      {comment.userName.charAt(0).toUpperCase()}
                                  </div>
                              )}
                          </div>
                          <div className="flex-1">
                              <div className="flex justify-between items-baseline mb-1">
                                  <h4 className="text-sm font-bold text-gray-900">{comment.userName}</h4>
                                  <span className="text-[10px] text-gray-400 font-medium">
                                      {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed mb-2">{comment.text}</p>
                              <div className="flex items-center gap-4">
                                  <button className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-[#7D2596] transition-colors">
                                      <MessageCircle size={14}/> Reply
                                  </button>
                                  <button className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-red-500 transition-colors">
                                      <Heart size={14}/> Like
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
                  {comments.length === 0 && (
                      <div className="text-center py-6">
                          <p className="text-sm text-gray-400">No comments yet. Start the conversation!</p>
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
}