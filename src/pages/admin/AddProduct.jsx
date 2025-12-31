import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Save, X } from 'lucide-react';
import { uploadProductImage, addProduct } from '../../services/productService';

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    setLoading(true);

    try {
      // 1. Upload Image First
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      }

      // 2. Prepare Data
      const finalProduct = {
        ...formData,
        price: parseFloat(formData.price), // Ensure numbers are numbers
        stock: parseInt(formData.stock),
        imageUrl: imageUrl || "https://via.placeholder.com/150", // Fallback image
        sales: 0,
        rating: 0
      };

      // 3. Save to Firestore
      await addProduct(finalProduct);
      
      alert("Product Added Successfully!");
      navigate('/admin/dashboard'); // Go back to dashboard
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Row 1: Name & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
            <input 
              type="text" name="name" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Men's Cotton T-Shirt"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              name="category" required 
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              <option value="Fashion">Fashion</option>
              <option value="Electronics">Electronics</option>
              <option value="Bags">Bags</option>
              <option value="Footwear">Footwear</option>
              <option value="Beauty">Beauty</option>
            </select>
          </div>
        </div>

        {/* Row 2: Price & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
            <input 
              type="number" name="price" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
            <input 
              type="number" name="stock" required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., 50"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
            <input 
              type="file" accept="image/*" required
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImageChange}
            />
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Preview" className="h-32 rounded-lg object-cover" />
                <button type="button" onClick={() => setPreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <Upload size={32} className="mb-2" />
                <p>Click to upload image</p>
                <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30"
          >
            {loading ? 'Uploading...' : <><Save size={20} /> Save Product</>}
          </button>
        </div>

      </form>
    </div>
  );
}