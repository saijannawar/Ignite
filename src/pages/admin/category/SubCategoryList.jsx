import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { getCategories } from '../../../services/categoryService';
import { getSubCategories, deleteSubCategory } from '../../../services/subCategoryService';

export default function SubCategoryList() {
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Track which accordion items are open. Example: { 'id_of_fashion': true }
  const [expanded, setExpanded] = useState({});

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mains, subs] = await Promise.all([getCategories(), getSubCategories()]);
        setMainCategories(mains);
        setSubCategories(subs);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Toggle Accordion
  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Delete Sub Category
  const handleDelete = async (id) => {
    if (window.confirm("Delete this sub category?")) {
      await deleteSubCategory(id);
      setSubCategories(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Sub Category List</h2>
        <Link to="/admin/subcategory/add">
          <button className="bg-[#3b82f6] hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors">
            ADD NEW SUB CATEGORY
          </button>
        </Link>
      </div>

      {/* Accordion List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-gray-500">Loading list...</div>
        ) : (
          mainCategories.map((mainCat) => {
            // Find children for this parent
            const children = subCategories.filter(sub => sub.parentCategoryId === mainCat.id);
            const isOpen = expanded[mainCat.id];

            return (
              <div key={mainCat.id} className="border-b border-gray-100 last:border-0">
                
                {/* Main Category Header (Gray Bar) */}
                <div 
                  onClick={() => toggleExpand(mainCat.id)}
                  className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <span className="font-medium text-gray-800 flex items-center gap-2">
                    {mainCat.name}
                  </span>
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>

                {/* Sub Categories List (White Area) */}
                {isOpen && (
                  <div className="bg-white">
                    {children.length === 0 ? (
                      <div className="p-4 text-sm text-gray-400 italic pl-8">No sub categories added yet.</div>
                    ) : (
                      children.map((sub) => (
                        <div key={sub.id} className="flex justify-between items-center p-3 pl-8 border-b border-gray-50 hover:bg-gray-50">
                          <span className="text-sm text-gray-600">{sub.name}</span>
                          <div className="flex gap-3">
                             <button className="text-gray-400 hover:text-green-600"><Edit2 size={14} /></button>
                             <button onClick={() => handleDelete(sub.id)} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
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