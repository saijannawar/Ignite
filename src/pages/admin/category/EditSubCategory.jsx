import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { Save, ArrowLeft, Loader } from 'lucide-react';

export default function EditSubCategory() {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [name, setName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [categories, setCategories] = useState([]); // Main categories for dropdown

  // 1. Fetch Data (SubCategory Details + All Main Categories)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Fetch All Main Categories (for the dropdown)
        const catSnap = await getDocs(collection(db, "categories"));
        const catList = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(catList);

        // B. Fetch the Specific Sub Category to Edit
        const docRef = doc(db, "subcategories", id); // Make sure collection name matches your DB
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setParentCategoryId(data.parentCategoryId || ''); // This links it to the main category
        } else {
          alert("Sub Category not found!");
          navigate('/admin/subcategory');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // 2. Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !parentCategoryId) {
      alert("Please fill in all fields");
      return;
    }

    setUpdating(true);
    try {
      const subCatRef = doc(db, "subcategories", id);
      await updateDoc(subCatRef, {
        name: name,
        parentCategoryId: parentCategoryId,
        updatedAt: new Date()
      });

      alert("Sub Category Updated Successfully!");
      navigate('/admin/subcategory'); // Go back to list
    } catch (error) {
      console.error("Error updating:", error);
      alert("Failed to update sub category.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center"><Loader className="animate-spin text-[#7D2596]" /></div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md border border-gray-100 mt-10">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Sub Category</h1>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        
        {/* Main Category Dropdown */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Parent Category</label>
            <select 
                value={parentCategoryId} 
                onChange={(e) => setParentCategoryId(e.target.value)} 
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-[#7D2596] bg-white"
                required
            >
                <option value="">Select Parent Category</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
        </div>

        {/* Sub Category Name */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Sub Category Name</label>
            <input 
                type="text"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-[#7D2596]" 
                required 
            />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={updating}
          className="w-full py-4 bg-[#7D2596] text-white font-bold rounded-lg hover:bg-[#631d76] transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-100 disabled:bg-gray-400"
        >
          {updating ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
          {updating ? 'Updating...' : 'Update Sub Category'}
        </button>

      </form>
    </div>
  );
}