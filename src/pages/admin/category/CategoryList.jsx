import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Edit2, ArrowUp, ArrowDown, Plus, Loader } from 'lucide-react';
import { getCategories, deleteCategory } from '../../../services/categoryService';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // --- 1. FETCH & SORT ---
  const fetchData = async () => {
    try {
      const data = await getCategories();
      // Sort by 'order' field. If 'order' is missing, default to 0.
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
      // Use a Batch write for efficiency (all updates happen at once)
      const batch = writeBatch(db);
      
      updatedCategories.forEach((cat, index) => {
        if (!cat.id) return; // Safety check
        const docRef = doc(db, "categories", cat.id);
        // We update the 'order' field to match the array index
        batch.update(docRef, { order: index });
      });

      await batch.commit();
      console.log("Order saved successfully to Firebase!");
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Failed to save new order. Please refresh and try again.");
    } finally {
      setUpdating(false);
    }
  };

  // --- 3. MOVE UP HANDLER ---
  const moveUp = (index) => {
    if (index === 0) return; // Already at top
    
    // Create a copy of the array
    const newCategories = [...categories];
    
    // Swap current item with the one above it
    const temp = newCategories[index];
    newCategories[index] = newCategories[index - 1];
    newCategories[index - 1] = temp;
    
    // Update UI immediately
    setCategories(newCategories);
    
    // Save new order to Database
    saveOrderToFirebase(newCategories);
  };

  // --- 4. MOVE DOWN HANDLER ---
  const moveDown = (index) => {
    if (index === categories.length - 1) return; // Already at bottom
    
    const newCategories = [...categories];
    
    // Swap current item with the one below it
    const temp = newCategories[index];
    newCategories[index] = newCategories[index + 1];
    newCategories[index + 1] = temp;
    
    setCategories(newCategories);
    saveOrderToFirebase(newCategories);
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
            {updating && (
              <span className="text-xs text-[#7D2596] font-bold flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-full animate-pulse">
                <Loader size={12} className="animate-spin"/> Saving Order...
              </span>
            )}
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
                  <td className="p-5 text-center font-bold text-gray-400">#{index + 1}</td>

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
                        {/* UP Button */}
                        <button 
                          onClick={() => moveUp(index)}
                          disabled={index === 0 || updating}
                          className={`p-2 rounded-full transition-colors ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-[#7D2596]'}`}
                          title="Move Up"
                        >
                          <ArrowUp size={18} />
                        </button>

                        {/* DOWN Button */}
                        <button 
                          onClick={() => moveDown(index)}
                          disabled={index === categories.length - 1 || updating}
                          className={`p-2 rounded-full transition-colors ${index === categories.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-[#7D2596]'}`}
                          title="Move Down"
                        >
                          <ArrowDown size={18} />
                        </button>
                      </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-3">
                      
                      {/* Edit Button */}
                      <Link to={`/admin/category/edit/${cat.id}`}>
                        <button className="p-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 hover:text-green-700 transition-all shadow-sm">
                            <Edit2 size={18} />
                        </button>
                      </Link>
                      
                      {/* Delete Button */}
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
      </div>
    </div>
  );
}