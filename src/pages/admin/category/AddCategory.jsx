import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, CloudUpload } from 'lucide-react';
import { uploadCategoryImage, addCategory } from '../../../services/categoryService';

export default function AddCategory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !imageFile) return alert("Please fill all fields!");

    setLoading(true);
    try {
      // 1. Upload Image
      const imageUrl = await uploadCategoryImage(imageFile);
      
      // 2. Save Data
      await addCategory({ 
        name, 
        imageUrl 
      });

      alert("Category Added Successfully!");
      navigate('/admin/category'); // Go to list
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Add New Category</h2>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Fashion"
            />
          </div>

          {/* Image Upload Box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center relative hover:bg-gray-50 transition-colors bg-gray-50/50">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {preview ? (
                <div className="relative h-full w-full p-2 flex justify-center">
                  <img src={preview} alt="Preview" className="h-full object-contain rounded" />
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreview(null); setImageFile(null); }}
                    className="absolute top-2 right-2 bg-white p-1 rounded-full shadow-md z-20 hover:bg-red-50 text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                     <Upload size={20} className="text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Image Upload</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-2.5 rounded shadow-sm flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Publishing...' : <><CloudUpload size={18} /> PUBLISH AND VIEW</>}
          </button>

        </form>
      </div>
    </div>
  );
}