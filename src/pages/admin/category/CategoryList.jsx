import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2 } from 'lucide-react';
import { getCategories, deleteCategory } from '../../../services/categoryService';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data
  const fetchData = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Category List</h2>
        <Link to="/admin/category/add">
          <button className="bg-[#3b82f6] hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors">
            ADD CATEGORY
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Image</th>
              <th className="p-4">Category Name</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan="3" className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="3" className="p-8 text-center text-gray-500">No categories found.</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 p-1">
                      <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-contain" />
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-700">{cat.name}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        <div className="p-3 border-t border-gray-100 flex justify-end text-xs text-gray-500 gap-4">
            <span>Rows per page: 10</span>
            <span>1–10 of {categories.length}</span>
        </div>
      </div>
    </div>
  );
}