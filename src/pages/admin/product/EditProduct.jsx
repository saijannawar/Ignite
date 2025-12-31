import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CloudUpload, X, Star } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { getCategories } from '../../../services/categoryService';
import { getSubCategories } from '../../../services/subCategoryService';
import { uploadProductImages } from '../../../services/productService';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Dropdown Data
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: '', description: '', category: '', subCategory: '', price: '',
    oldPrice: '', brand: '', stock: '', discount: '', rating: 0
  });

  // Image State (URLs only for simplicity in edit mode, plus new files)
  const [existingImages, setExistingImages] = useState([]); // URLs from DB
  const [newImageFiles, setNewImageFiles] = useState([]);   // New files to upload
  const [newPreviews, setNewPreviews] = useState([]);       // Previews for new files

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, subs] = await Promise.all([getCategories(), getSubCategories()]);
        setCategories(cats);
        setSubCategories(subs);

        // Fetch Product Data
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            description: data.description || '',
            category: data.category || '',
            subCategory: data.subCategory || '',
            price: data.price || '',
            oldPrice: data.oldPrice || '',
            brand: data.brand || '',
            stock: data.stock || '',
            discount: data.discount || '',
            rating: data.rating || 0
          });
          setExistingImages(data.images || (data.imageUrl ? [data.imageUrl] : []));
          
          // Trigger SubCategory Filter immediately
          if (data.category) {
            setFilteredSubCats(subs.filter(s => s.parentCategoryId === data.category));
          }
        } else {
          alert("Product not found");
          navigate('/admin/products');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // Handle Inputs
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRating = (count) => setFormData({ ...formData, rating: count });
  
  // Handle Category Change
  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setFormData({ ...formData, category: catId, subCategory: '' });
    setFilteredSubCats(subCategories.filter(sub => sub.parentCategoryId === catId));
  };

  // Image Handlers
  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setNewImageFiles([...newImageFiles, ...files]);
    setNewPreviews([...newPreviews, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
    setNewPreviews(newPreviews.filter((_, i) => i !== index));
  };

  // Update Logic
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // 1. Upload NEW images if any
      let newImageUrls = [];
      if (newImageFiles.length > 0) {
        newImageUrls = await uploadProductImages(newImageFiles);
      }

      // 2. Combine with remaining existing images
      const finalImages = [...existingImages, ...newImageUrls];

      // 3. Update Firestore
      const productRef = doc(db, "products", id);
      
      const catName = categories.find(c => c.id === formData.category)?.name || '';
      const subName = subCategories.find(s => s.id === formData.subCategory)?.name || '';

      await updateDoc(productRef, {
        ...formData,
        price: parseFloat(formData.price),
        oldPrice: parseFloat(formData.oldPrice || 0),
        stock: parseInt(formData.stock || 0),
        discount: parseInt(formData.discount || 0),
        images: finalImages,
        imageUrl: finalImages.length > 0 ? finalImages[0] : '', // Update thumbnail
        categoryName: catName,
        subCategoryName: subName,
        updatedAt: new Date()
      });

      alert("Product Updated Successfully!");
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      alert("Failed to update product");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Data...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Product</h2>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
           {/* Reuse similar layout as AddProduct for consistency */}
           <div><label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label><input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50" required /></div>
           <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea name="description" value={formData.description} rows="4" onChange={handleChange} className="w-full p-2 border rounded bg-gray-50"></textarea></div>
           
           <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Category</label><select name="category" value={formData.category} onChange={handleCategoryChange} className="w-full p-2 border rounded bg-gray-50"><option value="">Select...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Sub Category</label><select name="subCategory" value={formData.subCategory} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50"><option value="">Select...</option>{filteredSubCats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Stock</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded bg-gray-50" /></div>
           </div>
           
           {/* Image Editing Section */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
             <div className="flex flex-wrap gap-2 mb-2">
               {/* Existing Images */}
               {existingImages.map((img, i) => (
                 <div key={i} className="relative w-20 h-20 border rounded overflow-hidden">
                   <img src={img} className="w-full h-full object-cover" />
                   <button type="button" onClick={() => removeExistingImage(i)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X size={10}/></button>
                 </div>
               ))}
               {/* New Previews */}
               {newPreviews.map((img, i) => (
                 <div key={`new-${i}`} className="relative w-20 h-20 border rounded overflow-hidden ring-2 ring-blue-500">
                   <img src={img} className="w-full h-full object-cover" />
                   <button type="button" onClick={() => removeNewImage(i)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X size={10}/></button>
                 </div>
               ))}
             </div>
             <input type="file" multiple onChange={handleNewImageChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
           </div>

        </div>

        <button type="submit" disabled={isUpdating} className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-3 rounded shadow transition-colors">
          {isUpdating ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}