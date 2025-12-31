import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CloudUpload, X, Star, Plus, Image as ImageIcon } from 'lucide-react'; 
import { getCategories } from '../../../services/categoryService';
import { getSubCategories } from '../../../services/subCategoryService';
import { uploadProductImages, uploadProductImage, addProduct } from '../../../services/productService'; 

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- Dropdown Data ---
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', subCategory: '', price: '',
    oldPrice: '', brand: '', isFeatured: 'false', stock: '', discount: '',
    rating: 0
  });

  // --- Main Product Images State ---
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // --- Banner Configuration State ---
  const [isBannerEnabled, setIsBannerEnabled] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // 1. Fetch Categories
  useEffect(() => {
    const fetchData = async () => {
      const [cats, subs] = await Promise.all([getCategories(), getSubCategories()]);
      setCategories(cats);
      setSubCategories(subs);
    };
    fetchData();
  }, []);

  // 2. Handle Category Change
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setFormData({ ...formData, category: catId, subCategory: '' });
    setFilteredSubCats(subCategories.filter(sub => sub.parentCategoryId === catId));
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRating = (count) => setFormData({ ...formData, rating: count });

  // --- Main Images Handlers ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const updatedFiles = [...imageFiles, ...files];
    setImageFiles(updatedFiles);
    setPreviews(updatedFiles.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  // --- Banner Image Handler ---
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const removeBanner = () => {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(null);
    setBannerPreview(null);
  };

  // --- Submit Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || imageFiles.length === 0) {
      return alert("Please fill required fields and select at least one product image.");
    }

    setLoading(true);
    try {
      // 1. Upload Product Images
      const imageUrls = await uploadProductImages(imageFiles);

      // 2. Upload Banner Image (if enabled)
      let bannerUrl = '';
      if (isBannerEnabled && bannerFile) {
        bannerUrl = await uploadProductImage(bannerFile); 
      }

      // 3. Prepare Data
      const catName = categories.find(c => c.id === formData.category)?.name || '';
      const subName = subCategories.find(s => s.id === formData.subCategory)?.name || '';

      await addProduct({
        ...formData,
        images: imageUrls,
        categoryName: catName,
        subCategoryName: subName,
        // Save Banner Data
        isBanner: isBannerEnabled,
        bannerTitle: isBannerEnabled ? bannerTitle : '',
        bannerImageUrl: bannerUrl
      });

      alert("Product Published Successfully!");
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Add Product</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
           {/* Basic Info */}
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
             <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label><input name="name" onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 outline-none" required /></div>
             <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label><textarea name="description" rows="4" onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 outline-none"></textarea></div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><label className="block text-sm font-medium text-gray-700 mb-1">Category *</label><select name="category" onChange={handleCategoryChange} className="w-full p-2 border rounded bg-gray-50 outline-none" required><option value="">Select...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                 <div><label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label><select name="subCategory" onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 outline-none"><option value="">Select...</option>{filteredSubCats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                 <div><label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label><input type="number" name="price" onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 outline-none" required /></div>
                 <div><label className="block text-sm font-medium text-gray-700 mb-1">Old Price (₹)</label><input type="number" name="oldPrice" onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 outline-none" /></div>
                 <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" name="stock" onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 outline-none" /></div>
                 <div><label className="block text-sm font-medium text-gray-700 mb-1">Brand</label><input type="text" name="brand" onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 outline-none" /></div>
                 <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label><input type="number" name="discount" onChange={handleChange} className="w-full p-2 border rounded bg-gray-50 outline-none" /></div>
                 
                 {/* Rating */}
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Rating</label>
                    <div className="flex gap-1 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} size={20} className={`cursor-pointer ${star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} onClick={() => handleRating(star)} />
                      ))}
                    </div>
                 </div>
             </div>
           </div>

           {/* --- BANNER SECTION --- */}
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <div className="flex items-center justify-between mb-4">
               <h3 className="font-bold text-gray-700">Banner Images</h3>
               {/* Toggle Switch */}
               <label className="relative inline-flex items-center cursor-pointer">
                 <input type="checkbox" checked={isBannerEnabled} onChange={() => setIsBannerEnabled(!isBannerEnabled)} className="sr-only peer" />
                 <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
               </label>
             </div>

             {/* Conditional Render */}
             {isBannerEnabled && (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                 <div className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex flex-col items-center justify-center relative hover:bg-gray-50 bg-gray-50 group">
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                    {bannerPreview ? (
                      <div className="relative w-full h-full p-2">
                        <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover rounded" />
                        <button type="button" onClick={removeBanner} className="absolute top-2 right-2 bg-white p-1 rounded-full shadow text-red-500 z-30 hover:bg-red-50"><X size={16}/></button>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon size={28} className="mx-auto mb-2" />
                        <p className="text-sm">Upload Banner Image</p>
                      </div>
                    )}
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banner Title</label>
                    <input type="text" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="e.g., Big Sale on this Item!" className="w-full p-2 border border-gray-300 rounded bg-white outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* RIGHT COLUMN (Main Images & Publish) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
             <h3 className="font-bold text-gray-700 mb-4">Product Images</h3>
             <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center relative hover:bg-gray-50 bg-gray-50 mb-4">
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                {previews.length > 0 ? (
                  <img src={previews[0]} alt="Main" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-gray-400"><Upload size={24} className="mx-auto"/><span className="text-xs">Upload Images</span></div>
                )}
             </div>
             
             {/* Thumbnails */}
             <div className="grid grid-cols-4 gap-2">
               {previews.map((src, i) => (
                 <div key={i} className="relative h-16 w-16 border rounded overflow-hidden">
                   <img src={src} className="w-full h-full object-cover" />
                   <button type="button" onClick={() => removeImage(i)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"><X size={10}/></button>
                 </div>
               ))}
               <div className="h-16 w-16 border-2 border-dashed rounded flex items-center justify-center text-gray-400 relative hover:bg-gray-50 hover:border-blue-400 hover:text-blue-400 transition-colors">
                 <Plus size={20} />
                 <input type="file" multiple onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
               </div>
             </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-4 rounded-lg shadow flex items-center justify-center gap-2 transition-colors text-lg disabled:opacity-70">
            {loading ? 'Publishing...' : <><CloudUpload size={20} /> PUBLISH PRODUCT</>}
          </button>
        </div>

      </form>
    </div>
  );
}