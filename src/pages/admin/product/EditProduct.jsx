import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, storage } from '../../../config/firebase'; 
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore'; 
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; 
import { Save, ArrowLeft, Loader, Trash2, Upload, X } from 'lucide-react';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]); 
  const [isManualInput, setIsManualInput] = useState(false); // Fallback state

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    stock: '',
    category: '',      
    subCategory: '',   
    description: '',
    brand: '',
    imageUrl: '',      
    images: []         
  });

  // 1. Fetch Categories & Product Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching Categories...");
        const catSnapshot = await getDocs(collection(db, "categories"));
        const cats = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Categories Found:", cats);
        setCategories(cats);

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
            subCategory: data.subCategory || '', 
            description: data.description || '',
            brand: data.brand || '',
            imageUrl: data.imageUrl || '',
            images: data.images || (data.imageUrl ? [data.imageUrl] : [])
          });
        } else {
          alert("Product not found!");
          navigate('/admin/products');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // 2. ✅ ULTRA ROBUST SUB-CATEGORY FETCHER
  useEffect(() => {
    const fetchSubCategories = async () => {
        if (!formData.category) {
            setSubCategoryOptions([]);
            return;
        }

        console.log("🔍 Looking for sub-categories for Category ID:", formData.category);
        let options = [];

        // STRATEGY 1: Check inside the Category Document (Array)
        const selectedCat = categories.find(c => c.id === formData.category);
        if (selectedCat && selectedCat.subCategories && Array.isArray(selectedCat.subCategories)) {
            console.log("✅ Found in Category Array");
            options = selectedCat.subCategories.map(s => typeof s === 'object' ? s.name : s);
        } 
        
        // STRATEGY 2: Check 'subcategories' Root Collection
        if (options.length === 0) {
            try {
                const q = query(collection(db, "subcategories"), where("categoryId", "==", formData.category));
                const subSnap = await getDocs(q);
                if (!subSnap.empty) {
                    console.log("✅ Found in 'subcategories' collection");
                    options = subSnap.docs.map(doc => doc.data().name);
                }
            } catch (err) { console.log("Did not find in root subcategories collection"); }
        }

        // STRATEGY 3: Check Sub-Collection (categories/{id}/subcategories)
        if (options.length === 0) {
            try {
                const subColRef = collection(db, "categories", formData.category, "subcategories");
                const subColSnap = await getDocs(subColRef);
                if (!subColSnap.empty) {
                    console.log("✅ Found in sub-collection");
                    options = subColSnap.docs.map(doc => doc.data().name);
                }
            } catch (err) { console.log("Did not find in sub-collection"); }
        }

        // Final Decision
        if (options.length > 0) {
            setSubCategoryOptions(options);
            setIsManualInput(false);
        } else {
            console.warn("⚠️ No sub-categories found. Switching to manual input.");
            setSubCategoryOptions([]);
            setIsManualInput(true); // Enable text box fallback
        }
    };

    fetchSubCategories();
  }, [formData.category, categories]);

  const handleCategoryChange = (e) => {
    setFormData(prev => ({ ...prev, category: e.target.value, subCategory: '' }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on("state_changed", null, (error) => {
            alert("Failed to upload image");
            setUploadingImage(false);
        }, async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, downloadURL], 
                imageUrl: prev.imageUrl || downloadURL 
            }));
            setUploadingImage(false);
        }
      );
    } catch (error) { setUploadingImage(false); }
  };

  const handleRemoveImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages, imageUrl: newImages[0] || '' }));
  };

  const handleSetMain = (url) => setFormData(prev => ({ ...prev, imageUrl: url }));
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const catObj = categories.find(c => c.id === formData.category);
      await updateDoc(doc(db, "products", id), {
        ...formData,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stock: Number(formData.stock),
        categoryName: catObj ? catObj.name : '',
        updatedAt: new Date()
      });
      alert("Product Updated!");
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      alert("Update Failed");
    } finally { setUpdating(false); }
  };

  if (loading) return <div className="p-10 text-center"><Loader className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md mt-10">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-sm font-bold mb-1">Name</label><input name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded" required /></div>
            <div><label className="block text-sm font-bold mb-1">Brand</label><input name="brand" value={formData.brand} onChange={handleChange} className="w-full p-3 border rounded" /></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm font-bold mb-1">Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 border rounded" required /></div>
            <div><label className="block text-sm font-bold mb-1">Original Price</label><input type="number" name="originalPrice" value={formData.originalPrice} onChange={handleChange} className="w-full p-3 border rounded" /></div>
            <div><label className="block text-sm font-bold mb-1">Stock</label><input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full p-3 border rounded" required /></div>
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleCategoryChange} className="w-full p-3 border rounded bg-white" required>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Sub Category</label>
                {/* ✅ DYNAMIC SWITCH: Dropdown or Input */}
                {isManualInput ? (
                    <input 
                        name="subCategory" 
                        value={formData.subCategory} 
                        onChange={handleChange} 
                        placeholder="Type sub-category manually..."
                        className="w-full p-3 border rounded focus:border-blue-500" 
                    />
                ) : (
                    <select name="subCategory" value={formData.subCategory} onChange={handleChange} className="w-full p-3 border rounded bg-white" disabled={!formData.category}>
                        <option value="">Select Sub Category</option>
                        {subCategoryOptions.map((sub, i) => <option key={i} value={sub}>{sub}</option>)}
                    </select>
                )}
            </div>
        </div>

        <div className="space-y-4">
             <label className="block text-sm font-bold">Images</label>
             <div className="flex items-center gap-4">
                 <label className={`flex items-center gap-2 px-4 py-2 rounded font-bold cursor-pointer ${uploadingImage ? 'bg-gray-200' : 'bg-black text-white'}`}>
                    {uploadingImage ? <Loader className="animate-spin" size={16}/> : <Upload size={16}/>} Upload
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage}/>
                 </label>
             </div>
             <div className="grid grid-cols-5 gap-4">
                 {formData.images.map((img, i) => (
                    <div key={i} className={`relative group border-2 rounded-lg overflow-hidden aspect-square ${formData.imageUrl === img ? 'border-purple-500' : 'border-gray-200'}`}>
                        <img src={img} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2">
                            <button type="button" onClick={() => handleSetMain(img)} className="text-xs bg-white px-2 py-1 rounded">Main</button>
                            <button type="button" onClick={() => handleRemoveImage(i)} className="bg-red-500 text-white p-1 rounded-full"><Trash2 size={12}/></button>
                        </div>
                    </div>
                 ))}
             </div>
        </div>

        <div><label className="block text-sm font-bold mb-1">Description</label><textarea name="description" rows="5" value={formData.description} onChange={handleChange} className="w-full p-3 border rounded"></textarea></div>

        <button type="submit" disabled={updating} className="w-full py-4 bg-[#7D2596] text-white font-bold rounded hover:bg-purple-800 disabled:bg-gray-400">
          {updating ? 'Saving...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}