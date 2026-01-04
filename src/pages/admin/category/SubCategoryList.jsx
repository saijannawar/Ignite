import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, ChevronDown, ChevronRight, Loader } from 'lucide-react';
import { getCategories } from '../../../services/categoryService';
import { getSubCategories, deleteSubCategory } from '../../../services/subCategoryService';

export default function SubCategoryList() {
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🚀 Starting Data Fetch...");
        
        // Fetch Main Categories
        const mains = await getCategories();
        console.log("✅ Main Categories Fetched:", mains);
        setMainCategories(mains);

        // Fetch Sub Categories
        const subs = await getSubCategories();
        console.log("✅ Sub Categories Fetched:", subs);
        setSubCategories(subs);
        
        // Auto-expand categories that have children
        const initialExpanded = {};
        mains.forEach(cat => {
            // Log matching attempts to help debug
            const children = subs.filter(sub => sub.parentCategoryId === cat.id);
            if (children.length > 0) {
                console.log(`Found ${children.length} subcategories for ${cat.name}`);
                initialExpanded[cat.id] = true;
            }
        });
        setExpanded(initialExpanded);

      } catch (error) {
        console.error("❌ Error fetching lists:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete sub-category "${name}"?`)) {
      setDeletingId(id);
      try {
        await deleteSubCategory(id);
        setSubCategories(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error("Error deleting sub-category:", error);
        alert("Failed to delete. Please try again.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader className="animate-spin text-[#7D2596]" /></div>;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
            <h2 className="text-xl font-bold text-gray-800">Sub Category List</h2>
            <p className="text-xs text-gray-500 mt-1">Manage sub-categories for your main product categories</p>
        </div>
        <Link to="/admin/subcategory/add">
          <button className="bg-[#7D2596] hover:bg-[#631d76] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all uppercase tracking-wide">
            Add Sub Category
          </button>
        </Link>
      </div>

      {/* Accordion List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {mainCategories.length === 0 ? (
           <div className="p-8 text-center text-gray-500">No categories found.</div>
        ) : (
          mainCategories.map((mainCat) => {
            // MATCHING LOGIC: Ensure 'parentCategoryId' in subcategory matches 'id' of category
            const children = subCategories.filter(sub => sub.parentCategoryId === mainCat.id);
            const isOpen = expanded[mainCat.id];

            return (
              <div key={mainCat.id} className="border-b border-gray-100 last:border-0">
                
                {/* Main Category Header */}
                <div 
                  onClick={() => toggleExpand(mainCat.id)}
                  className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`p-1.5 rounded-md ${isOpen ? 'bg-[#7D2596] text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <span className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                        {mainCat.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${children.length > 0 ? 'bg-purple-100 text-[#7D2596] border-purple-200' : 'bg-white text-gray-400 border-gray-200'}`}>
                        {children.length}
                    </span>
                  </div>
                </div>

                {/* Sub Categories List */}
                {isOpen && (
                  <div className="bg-white">
                    {children.length === 0 ? (
                      <div className="p-4 text-xs text-gray-400 italic pl-14 border-t border-gray-50">
                        No sub-categories assigned.
                      </div>
                    ) : (
                      children.map((sub) => (
                        <div key={sub.id} className="flex justify-between items-center py-3 px-4 pl-14 border-t border-gray-50 hover:bg-purple-50/30 transition-colors group/item">
                          <span className="text-sm text-gray-600 font-medium">{sub.name}</span>
                          
                          <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity">
                             {/* EDIT BUTTON */}
                             <Link to={`/admin/subcategory/edit/${sub.id}`}>
                                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                                    <Edit2 size={16} />
                                </button>
                             </Link>

                             {/* DELETE BUTTON */}
                             <button 
                                onClick={() => handleDelete(sub.id, sub.name)} 
                                disabled={deletingId === sub.id}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                             >
                               {deletingId === sub.id ? <Loader size={16} className="animate-spin"/> : <Trash2 size={16} />}
                             </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}