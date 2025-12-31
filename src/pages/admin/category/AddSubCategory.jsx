import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudUpload } from 'lucide-react';
import { getCategories } from '../../../services/categoryService'; // To populate dropdown
import { addSubCategory } from '../../../services/subCategoryService'; // To save data

export default function AddSubCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // State
  const [categories, setCategories] = useState([]); // List of Main Categories
  const [selectedParentId, setSelectedParentId] = useState('');
  const [subCatName, setSubCatName] = useState('');

  // 1. Fetch Main Categories on Load
  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    loadCategories();
  }, []);

  // 2. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedParentId || !subCatName) return alert("Please fill all fields");

    setLoading(true);
    try {
      // Find name of parent for reference
      const parentCat = categories.find(c => c.id === selectedParentId);

      await addSubCategory({
        name: subCatName,
        parentCategoryId: selectedParentId,
        parentCategoryName: parentCat?.name || 'Unknown'
      });

      alert("Sub Category Added!");
      navigate('/admin/subcategory');
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Add New Sub Category</h2>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side: Add Sub Category */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Add Sub Category</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none bg-white text-gray-700"
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                  placeholder="e.g., Men, Mobile, Laptops"
                  value={subCatName}
                  onChange={(e) => setSubCatName(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-2.5 rounded shadow-sm flex items-center gap-2 font-medium transition-colors"
              >
                {loading ? 'Saving...' : <><CloudUpload size={18} /> PUBLISH AND VIEW</>}
              </button>
            </div>

            {/* Right Side: Placeholder for Third Level (Future) */}
            <div className="space-y-4 opacity-50 pointer-events-none">
              <h3 className="font-semibold text-gray-700 border-b pb-2">Add Third Level Category</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" disabled>
                  <option>Select Category</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sub Category Name</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100" disabled />
              </div>
              <button className="bg-[#3b82f6] text-white px-6 py-2.5 rounded shadow-sm flex items-center gap-2 font-medium" disabled>
                 <CloudUpload size={18} /> PUBLISH AND VIEW
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}