import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowUp, ArrowDown, Plus, Loader } from 'lucide-react';
import { getCategories, deleteCategory } from '../../../services/categoryService';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false); // To show saving status

  // --- 1. FETCH & SORT ---
  const fetchData = async () => {
    try {
      const data = await getCategories();
      // ✅ Sort by 'order' field immediately after fetching
      const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(sortedData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. SAVE ORDER TO FIREBASE ---
  const saveOrderToFirebase = async (updatedCategories) => {
    setUpdating(true);
    try {
      const batch = writeBatch(db);
      
      updatedCategories.forEach((cat, index) => {
        const docRef = doc(db, "categories", cat.id);
        batch.update(docRef, { order: index });
      });

      await batch.commit();
      console.log("Order saved!");
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save new order to database.");
    } finally {
      setUpdating(false);
    }
  };

  // --- 3. MOVE HANDLERS ---
  const moveUp = (index) => {
    if (index === 0) return;
    const newCategories = [...categories];
    
    // Swap items
    const temp = newCategories[index];
    newCategories[index] = newCategories[index - 1];
    newCategories[index - 1] = temp;
    
    setCategories(newCategories); // Update UI
    saveOrderToFirebase(newCategories); // Update DB
  };

  const moveDown = (index) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    
    // Swap items
    const temp = newCategories[index];
    newCategories[index] = newCategories[index + 1];
    newCategories[index + 1] = temp;
    
    setCategories(newCategories); // Update UI
    saveOrderToFirebase(newCategories); // Update DB
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      await deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Category List</h2>
            {updating && <span className="text-xs text-[#7D2596] font-bold flex items-center gap-1"><Loader size={12} className="animate-spin"/> Saving Order...</span>}
        </div>
        <Link to="/admin/category/add">
          <button className="bg-[#7D2596] hover:bg-[#631d76] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-purple-100 flex items-center gap-2 transition-all">
            <Plus size={18} /> ADD CATEGORY
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <th className="p-5 w-16 text-center">Order</th>
              <th className="p-5 w-20">Image</th>
              <th className="p-5">Category Name</th>
              <th className="p-5 text-center">Move</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-[#7D2596] font-medium animate-pulse">Loading categories...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic">No categories found.</td></tr>
            ) : (
              categories.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-purple-50/30 transition-colors group">
                  
                  {/* Order Index */}
                  <td className="p-5 text-center font-bold text-gray-400">
                    #{index + 1}
                  </td>

                  {/* Image */}
                  <td className="p-5">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 p-1">
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                    </div>
                  </td>

                  {/* Name */}
                  <td className="p-5 font-bold text-gray-700">{cat.name}</td>

                  {/* Move Buttons */}
                  <td className="p-5">
                     <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => moveUp(index)}
                          disabled={index === 0 || updating}
                          className={`p-2 rounded-full transition-colors ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-[#7D2596]'}`}
                        >
                          <ArrowUp size={18} />
                        </button>
                        <button 
                          onClick={() => moveDown(index)}
                          disabled={index === categories.length - 1 || updating}
                          className={`p-2 rounded-full transition-colors ${index === categories.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-[#7D2596]'}`}
                        >
                          <ArrowDown size={18} />
                        </button>
                     </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-3">
                      {/* Removed Edit Button to simplify action column as requested previously, or keep it if needed */}
                      {/* <button className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"><Edit2 size={16} /></button> */}
                      
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-2.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all shadow-sm"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Footer info */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
           <span>Total Categories: {categories.length}</span>
           <span>Reordering auto-saves to database</span>
        </div>
      </div>
    </div>
  );
}