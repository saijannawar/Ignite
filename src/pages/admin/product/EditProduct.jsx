import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../config/firebase'; // Adjust path as needed
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Save, ArrowLeft, Loader } from 'lucide-react';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: '',
    description: '',
    brand: ''
  });

  // 1. Fetch Existing Data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            price: data.price || '',
            originalPrice: data.originalPrice || '',
            stock: data.stock || '',
            category: data.category || '',
            description: data.description || '',
            brand: data.brand || ''
          });
        } else {
          alert("Product not found!");
          navigate('/admin/products');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  // 2. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Update Function
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const productRef = doc(db, "products", id);
      
      // ✅ Convert strings to numbers for prices
      await updateDoc(productRef, {
        name: formData.name,
        brand: formData.brand,
        price: Number(formData.price),           // Ensure Number
        originalPrice: Number(formData.originalPrice), // Ensure Number
        stock: Number(formData.stock),
        category: formData.category,
        description: formData.description,
        updatedAt: new Date()
      });

      alert("Product Updated Successfully!");
      navigate('/admin/products'); // Go back to list
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-gray-100 mt-10">
      
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
          <input 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="w-full p-3 border rounded-lg focus:outline-[#7D2596]" 
            required 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Selling Price (₹)</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-lg focus:outline-[#7D2596]" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Original Price (₹)</label>
            <input 
              type="number" 
              name="originalPrice" 
              value={formData.originalPrice} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-lg focus:outline-[#7D2596]" 
              placeholder="e.g. 500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity</label>
            <input 
              type="number" 
              name="stock" 
              value={formData.stock} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-lg focus:outline-[#7D2596]" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Brand</label>
            <input 
              type="text" 
              name="brand" 
              value={formData.brand} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-lg focus:outline-[#7D2596]" 
            />
          </div>
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea 
              name="description" 
              rows="4"
              value={formData.description} 
              onChange={handleChange} 
              className="w-full p-3 border rounded-lg focus:outline-[#7D2596]" 
            ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={updating}
          className="w-full py-3 bg-[#7D2596] text-white font-bold rounded-lg hover:bg-[#631d76] transition-all flex items-center justify-center gap-2"
        >
          {updating ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
          {updating ? 'Updating...' : 'Update Product'}
        </button>

      </form>
    </div>
  );
}