import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { getCategories } from '../../../services/categoryService';
import { addSubCategory } from '../../../services/subCategoryService'; // ✅ Uses the correct service

export default function AddSubCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    parentCategoryId: ''
  });

  // 1. Fetch Main Categories for Dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCats();
  }, []);

  // 2. Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.parentCategoryId) {
      alert("Please select a category and enter a name.");
      return;
    }

    setLoading(true);
    try {
      // Find the name of the parent category for reference (optional but useful)
      const parentCat = categories.find(c => c.id === formData.parentCategoryId);
      
      await addSubCategory({
        name: formData.name,
        parentCategoryId: formData.parentCategoryId,
        parentCategoryName: parentCat ? parentCat.name : '' 
      });

      alert("Sub Category Added Successfully!");
      navigate('/admin/subcategory'); // Redirect to list
    } catch (error) {
      console.error("Error adding sub category:", error);
      alert("Failed to add sub category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/subcategory" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="text-xl font-bold text-gray-800">Add Sub Category</h2>
      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Main Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Select Parent Category</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#7D2596] bg-white"
              value={formData.parentCategoryId}
              onChange={(e) => setFormData({...formData, parentCategoryId: e.target.value})}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Sub Category Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Sub Category Name</label>
            <input 
              type="text" 
              placeholder="e.g. Sensors, Motors, Wheels"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#7D2596]"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-[#7D2596] text-white font-bold rounded-lg hover:bg-[#631d76] transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-100 disabled:opacity-70"
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Saving...' : 'Save Sub Category'}
          </button>

        </form>
      </div>
    </div>
  );
}