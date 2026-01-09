import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Edit, Trash2, Plus, FileText, Search, Eye, 
    Share2, MessageCircle, BarChart2, X, Save, MoreHorizontal, CheckCircle
} from 'lucide-react';
// ✅ Import Comment Service Functions
import { 
    getBlogs, 
    deleteBlog, 
    getCommentsByBlogId, 
    updateComment, 
    deleteComment 
} from '../../../services/blogService';

export default function AdminBlogList() {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- COMMENT MODAL STATE ---
  const [selectedBlog, setSelectedBlog] = useState(null); // The blog currently viewing comments for
  const [modalComments, setModalComments] = useState([]); // List of comments for that blog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null); // Which comment is being edited?
  const [editText, setEditText] = useState(""); // The new text

  // --- INITIAL DATA FETCH ---
  const fetchBlogs = async () => {
    setLoading(true);
    const data = await getBlogs();
    setBlogs(data);
    setFilteredBlogs(data);

    // Fetch Comment Counts
    const counts = {};
    await Promise.all(data.map(async (blog) => {
        const comments = await getCommentsByBlogId(blog.id);
        counts[blog.id] = comments.length;
    }));
    setCommentCounts(counts);
    
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, []);

  // Search Logic
  useEffect(() => {
    const results = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (blog.category && blog.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredBlogs(results);
  }, [searchTerm, blogs]);

  // --- BLOG ACTIONS ---
  const handleDeleteBlog = async (id) => {
    if(window.confirm("Are you sure you want to delete this blog post?")) {
      await deleteBlog(id);
      fetchBlogs();
    }
  };

  const handleShare = (id) => {
    const url = `${window.location.origin}/blogs/${id}`;
    navigator.clipboard.writeText(url);
    alert("Blog link copied!");
  };

  // --- COMMENT MODAL ACTIONS ---
  const openCommentsModal = async (blog) => {
      setSelectedBlog(blog);
      setIsModalOpen(true);
      // Fetch fresh comments for this blog
      const comments = await getCommentsByBlogId(blog.id);
      setModalComments(comments);
  };

  const closeCommentsModal = () => {
      setIsModalOpen(false);
      setSelectedBlog(null);
      setModalComments([]);
      setEditingCommentId(null);
  };

  const handleStartEdit = (comment) => {
      setEditingCommentId(comment.id);
      setEditText(comment.text);
  };

  const handleSaveComment = async (commentId) => {
      try {
          await updateComment(commentId, editText);
          // Update local state immediately
          setModalComments(prev => prev.map(c => c.id === commentId ? { ...c, text: editText } : c));
          setEditingCommentId(null);
      } catch (error) {
          alert("Failed to update comment");
      }
  };

  const handleDeleteComment = async (commentId) => {
      if(!window.confirm("Delete this comment?")) return;
      try {
          await deleteComment(commentId);
          // Remove from local list
          setModalComments(prev => prev.filter(c => c.id !== commentId));
          // Update count in background list
          setCommentCounts(prev => ({ ...prev, [selectedBlog.id]: (prev[selectedBlog.id] || 1) - 1 }));
      } catch (error) {
          alert("Failed to delete comment");
      }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans relative">
      <div className="max-w-7xl mx-auto">
      
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div className="flex-1 w-full md:w-auto">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-[#7D2596]/10 rounded-xl text-[#7D2596]">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">Blog Management</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage articles and moderate comments.</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative group flex-1 md:w-64">
                    <input 
                        type="text" 
                        placeholder="Search articles..." 
                        className="w-full pl-10 pr-4 py-3 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#7D2596]/20 outline-none text-sm font-medium transition-all group-hover:shadow-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={18} className="absolute left-3 top-3.5 text-gray-400 group-hover:text-[#7D2596] transition-colors" />
                </div>

                {/* Add Button */}
                <Link to="/admin/blogs/add" className="bg-[#7D2596] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:bg-[#631d76] hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap active:scale-95">
                    <Plus size={20} /> <span className="hidden md:inline">New Article</span>
                </Link>
            </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="p-5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Article</th>
                            <th className="p-5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Category</th>
                            <th className="p-5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Stats</th>
                            <th className="p-5 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Published</th>
                            <th className="p-5 text-xs font-extrabold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan="5" className="p-12 text-center text-gray-400"><div className="animate-spin w-6 h-6 border-2 border-[#7D2596] border-t-transparent rounded-full mx-auto mb-2"></div>Loading data...</td></tr>
                        ) : filteredBlogs.length === 0 ? (
                            <tr><td colSpan="5" className="p-12 text-center text-gray-400 italic">No blogs found.</td></tr>
                        ) : (
                            filteredBlogs.map((blog) => (
                            <tr key={blog.id} className="hover:bg-purple-50/30 transition-colors group">
                                
                                {/* 1. Article */}
                                <td className="p-5 max-w-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-12 rounded-lg overflow-hidden shadow-sm flex-shrink-0 relative">
                                            <img src={blog.imageUrl} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 border border-black/5 rounded-lg"></div>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-[#7D2596] transition-colors">
                                                {blog.title}
                                            </h3>
                                            <span className="text-xs text-gray-400 font-medium">
                                                by {blog.author || 'Admin'}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                {/* 2. Category */}
                                <td className="p-5">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-500 border border-gray-200">
                                        {blog.category || 'General'}
                                    </span>
                                </td>

                                {/* 3. Stats */}
                                <td className="p-5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500" title="Views">
                                            <BarChart2 size={16} className="text-blue-500 bg-blue-50 p-0.5 rounded"/>
                                            {blog.views || 0}
                                        </div>
                                        {/* ✅ CLICKABLE COMMENT STAT */}
                                        <button 
                                            onClick={() => openCommentsModal(blog)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#7D2596] transition-colors group/comments" 
                                            title="Manage Comments"
                                        >
                                            <MessageCircle size={16} className="text-green-500 bg-green-50 p-0.5 rounded group-hover/comments:text-white group-hover/comments:bg-[#7D2596] transition-colors"/>
                                            {commentCounts[blog.id] || 0}
                                        </button>
                                    </div>
                                </td>

                                {/* 4. Date */}
                                <td className="p-5 text-xs font-bold text-gray-400">
                                    {new Date(blog.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' })}
                                </td>

                                {/* 5. Actions */}
                                <td className="p-5 text-right">
                                    <div className="flex justify-end items-center gap-1">
                                        
                                        {/* ✅ Manage Comments Button */}
                                        <button onClick={() => openCommentsModal(blog)} className="p-2 text-gray-400 hover:text-[#7D2596] hover:bg-purple-50 rounded-lg transition-all" title="Manage Comments">
                                            <MessageCircle size={18} />
                                        </button>

                                        <Link to={`/blogs/${blog.id}`} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Live">
                                            <Eye size={18} />
                                        </Link>
                                        
                                        <button onClick={() => handleShare(blog.id)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all" title="Copy Link">
                                            <Share2 size={18} />
                                        </button>

                                        <Link to={`/admin/blogs/edit/${blog.id}`} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Edit Article">
                                            <Edit size={18} />
                                        </Link>

                                        <button onClick={() => handleDeleteBlog(blog.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* ======================= */}
        {/* ✅ COMMENTS MODAL       */}
        {/* ======================= */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <h3 className="text-lg font-black text-gray-800">Manage Comments</h3>
                            <p className="text-xs text-gray-500">For: <span className="font-bold text-[#7D2596]">{selectedBlog?.title}</span></p>
                        </div>
                        <button onClick={closeCommentsModal} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Modal Body (Scrollable) */}
                    <div className="p-6 overflow-y-auto flex-1 space-y-4">
                        {modalComments.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <MessageCircle size={40} className="mx-auto mb-2 opacity-20" />
                                <p>No comments on this post yet.</p>
                            </div>
                        ) : (
                            modalComments.map(comment => (
                                <div key={comment.id} className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-purple-100 text-[#7D2596] flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {comment.userName?.charAt(0).toUpperCase() || 'U'}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{comment.userName}</h4>
                                                <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            {editingCommentId !== comment.id && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleStartEdit(comment)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDeleteComment(comment.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Edit Mode vs View Mode */}
                                        {editingCommentId === comment.id ? (
                                            <div className="mt-2">
                                                <textarea 
                                                    className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#7D2596]/20 focus:border-[#7D2596] outline-none resize-none"
                                                    rows="3"
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                />
                                                <div className="flex gap-2 mt-2 justify-end">
                                                    <button onClick={() => setEditingCommentId(null)} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                                    <button onClick={() => handleSaveComment(comment.id)} className="px-3 py-1.5 text-xs font-bold text-white bg-[#7D2596] hover:bg-[#631d76] rounded-lg flex items-center gap-1">
                                                        <Save size={14} /> Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-600 leading-relaxed">{comment.text}</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-right">
                        <button onClick={closeCommentsModal} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}