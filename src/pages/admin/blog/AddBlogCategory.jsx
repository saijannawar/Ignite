import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader, Image as ImageIcon } from 'lucide-react';
import { addBlogCategory, uploadCategoryImage } from '../../../services/blogCategoryService';

export default function AddBlogCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Category name is required");

    setLoading(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadCategoryImage(imageFile);
      }
      
      await addBlogCategory(name, imageUrl);
      navigate('/admin/blog-categories');
    } catch (error) {
      console.error(error);
      alert("Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/blog-categories')} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Add Category</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        
        {/* Name Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
          <input 
            type="text" 
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7D2596]"
            placeholder="e.g. IoT Projects, News, Tutorials"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Image Input */}
        <div>
           <label className="block text-sm font-bold text-gray-700 mb-2">Category Image</label>
           <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors ${preview ? 'border-[#7D2596] bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`}>
              
              {preview ? (
                  <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden shadow-sm">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
              ) : (
                  <div className="text-gray-300 mb-3"><ImageIcon size={40} /></div>
              )}
              
              <label className="cursor-pointer bg-white border border-gray-200 text-gray-700 text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                  {preview ? 'Change Image' : 'Upload Icon/Image'}
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
           </div>
        </div>
        
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-[#7D2596] text-white font-bold py-3 rounded-lg hover:bg-[#631d76] flex items-center justify-center gap-2 transition-all shadow-md"
        >
           {loading ? <Loader className="animate-spin" /> : <Save size={20} />}
           Save Category
        </button>
      </div>
    </div>
  );
}