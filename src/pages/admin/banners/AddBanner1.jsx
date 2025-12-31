import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadBannerImage, addBanner } from '../../../services/productService';
import { getCategories } from '../../../services/categoryService'; // ✅ Import Category Service
import { Upload, X, CloudUpload } from 'lucide-react';

export default function AddBanner1() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // ✅ State for Categories
  const [categoriesList, setCategoriesList] = useState([]);

  // Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [thirdCategory, setThirdCategory] = useState('');
  const [price, setPrice] = useState('');
  const [alignInfo, setAlignInfo] = useState('Left');

  // ✅ Fetch Categories on Load
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategoriesList(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCats();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select an image");

    try {
      setLoading(true);
      const imageUrl = await uploadBannerImage(imageFile);
      
      await addBanner({
        type: 'home_1', 
        imageUrl,
        title,
        category, // Saves the selected category name or ID
        subCategory,
        thirdCategory,
        price,
        alignInfo
      });

      alert("Banner added!");
      navigate('/admin/banners/home-1');
    } catch (error) {
      alert("Failed to add banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-700">Add Home Banner List 1</h2>
          <button onClick={() => navigate('/admin/banners/home-1')}><X className="text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Banner Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Banner Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded focus:border-blue-500 outline-none" />
            </div>

            {/* ✅ REAL CATEGORY DROPDOWN */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)} 
                className="w-full p-2.5 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white"
              >
                <option value="">Select Category</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category (Static or Requires SubCat Service) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sub Category</label>
              <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white">
                <option value="">Select Sub Category</option>
                <option value="example-sub">Example Sub Category</option>
              </select>
            </div>

            {/* Third Level Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Third Level Category</label>
              <select value={thirdCategory} onChange={e => setThirdCategory(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white">
                <option value="">Select</option>
                <option value="example-third">Example Third Level</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Price</label>
              <input type="text" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded focus:border-blue-500 outline-none" />
            </div>

            {/* Align Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Align Info</label>
              <select value={alignInfo} onChange={e => setAlignInfo(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded focus:border-blue-500 outline-none bg-white">
                <option value="Left">Left</option>
                <option value="Right">Right</option>
              </select>
            </div>
          </div>

          {/* Image Upload Block */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Image</h3>
            <div className={`w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative ${preview ? 'border-blue-500' : ''}`}>
              <input type="file" onChange={handleImageChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-contain p-2" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <Upload className="text-gray-500" size={24} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Image Upload</span>
                </>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="bg-[#3b82f6] text-white px-8 py-3 rounded font-bold text-sm hover:bg-blue-700 shadow-md uppercase flex items-center gap-2">
            <CloudUpload size={20} /> {loading ? 'Uploading...' : 'Publish and View'}
          </button>

        </form>
      </div>
    </div>
  );
}