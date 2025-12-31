import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingCart, LogOut, User } from 'lucide-react';
import { getCategories } from '../../services/categoryService';
import { getSubCategories } from '../../services/subCategoryService';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase';

const CategorySidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // To check login state
  
  // State for data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State for Accordion
  const [expanded, setExpanded] = useState(null);

  // Fetch Data when Sidebar opens
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch both lists in parallel
          const [catsData, subsData] = await Promise.all([
            getCategories(),
            getSubCategories()
          ]);
          setCategories(catsData);
          setSubCategories(subsData);
        } catch (error) {
          console.error("Error loading sidebar data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const toggleCategory = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleLogout = async () => {
    await auth.signOut();
    onClose();
    navigate('/login');
  };

  return (
    <div className={`relative z-[999] ${isOpen ? 'visible' : 'invisible'}`}>
      
      {/* 1. Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* 2. Sidebar Drawer */}
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-xs bg-white shadow-xl transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="bg-[#734F96] text-white p-1.5 rounded">
               <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-800">IGNITE<span className="text-[#C569E0]">NOW</span></span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* User Greeting (Optional) */}
        {currentUser && (
          <div className="px-5 py-3 bg-[#fdfaff] border-b border-purple-100 flex items-center gap-2">
            <User size={16} className="text-[#6A1B9A]" />
            <span className="text-sm font-medium text-[#C569E0]">Hi, {currentUser.displayName || "User"}</span>
          </div>
        )}

        {/* Title */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Shop By Categories</h3>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto h-[calc(100vh-180px)]">
          {loading ? (
             <div className="p-8 text-center text-gray-400 text-sm">Loading categories...</div>
          ) : (
            <ul>
              {categories.map((cat) => {
                // Find sub-categories for this specific parent
                const children = subCategories.filter(sub => sub.parentCategoryId === cat.id);
                const isExpanded = expanded === cat.id;

                return (
                  <li key={cat.id} className="border-b border-gray-50 last:border-0">
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      <div className="flex items-center gap-3">
                         {/* Optional: Show small image if available */}
                         {/* <img src={cat.imageUrl} className="w-6 h-6 object-contain" /> */}
                         <span className={`font-medium text-sm ${isExpanded ? 'text-[#734F96]' : 'text-gray-700'}`}>
                           {cat.name}
                         </span>
                      </div>
                      {/* Only show +/- if there are children, otherwise show generic arrow or nothing */}
                      {children.length > 0 && (
                        isExpanded ? <Minus size={14} className="text-[#734F96]" /> : <Plus size={14} className="text-gray-400" />
                      )}
                    </div>
                    
                    {/* Submenu Accordion */}
                    <div className={`bg-gray-50 overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      {children.length > 0 ? (
                        <ul className="pl-4 pb-2">
                          {children.map((subItem) => (
                            <li key={subItem.id}>
                              <Link 
                                to={`/shop?category=${cat.id}&subcategory=${subItem.id}`} // Example Link
                                onClick={onClose}
                                className="block py-2.5 pl-4 text-sm text-gray-500 hover:text-[#734F96] border-l-2 border-transparent hover:border-[#734F96] transition-all"
                              >
                                {subItem.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-8 py-3 text-xs text-gray-400 italic">No sub-categories</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer: Dynamic Login/Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {currentUser ? (
            <button 
              onClick={handleLogout}
              className="w-full py-3 bg-gray-800 text-white font-bold rounded-lg shadow-md hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <Link to="/login" onClick={onClose}>
              <button className="w-full py-3 bg-[#734F96] text-white font-bold rounded-lg shadow-md hover:bg-[#5e3f7a] transition-colors">
                Login / Register
              </button>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
};

export default CategorySidebar;