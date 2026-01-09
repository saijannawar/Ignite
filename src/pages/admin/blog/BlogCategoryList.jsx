import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Tag } from 'lucide-react';
import { getBlogCategories, deleteBlogCategory } from '../../../services/blogCategoryService';

export default function BlogCategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCats = async () => {
    const data = await getBlogCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCats(); }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Delete this category?")) {
      await deleteBlogCategory(id);
      fetchCats();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Tag className="text-[#7D2596]" /> Blog Categories
            </h1>
        </div>
        <Link to="/admin/blog-categories/add" className="bg-[#7D2596] text-white px-5 py-2 rounded-lg font-bold shadow hover:bg-[#631d76] flex items-center gap-2">
          <Plus size={18} /> Add New
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : categories.length === 0 ? (
           <div className="p-8 text-center text-gray-400">No categories found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-4 w-24">Image</th>
                <th className="p-4">Name</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                       {cat.imageUrl ? (
                         <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-300"><Tag size={20}/></div>
                       )}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-gray-800">{cat.name}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}