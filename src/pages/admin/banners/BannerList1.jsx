import React, { useEffect, useState } from 'react';
import { getBanners, deleteBanner } from '../../../services/productService';
import { Trash2, Edit, Plus, Image as ImageIcon } from 'lucide-react'; 
import { Link } from 'react-router-dom';

export default function BannerList1() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch from 'home_banner' and filter for 'top'
  const fetchBanners = async () => {
    try {
        const data = await getBanners('home_banner');
        // Filter specifically for Banner List 1 (Top)
        const topBanners = data.filter(b => b.position === 'top');
        setBanners(topBanners);
    } catch (error) {
        console.error("Error loading banners:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Delete this banner?")) {
      await deleteBanner(id, 'home_banner'); // Ensure we delete from correct collection
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Home Banner List 1</h1>
            <p className="text-sm text-gray-500 mt-1">Manage the top section banners visible on the home page.</p>
        </div>
        <Link to="/admin/banners/home-1/add" className="bg-[#3b82f6] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-blue-700 shadow-md uppercase flex items-center gap-2 transition-all">
          <Plus size={20} /> Add New Banner
        </Link>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200 tracking-wider">
            <tr>
              <th className="p-5 w-1/4">Preview</th>
              <th className="p-5 w-1/4">Title / Category</th>
              <th className="p-5 w-1/4">Price</th>
              <th className="p-5 w-1/4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-500">Loading banners...</td></tr>
            ) : banners.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">No banners found for List 1. Add one to get started.</td></tr>
            ) : (
                banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-blue-50/30 transition-colors group">
                    {/* Image Preview */}
                    <td className="p-4">
                        <div className="w-48 h-28 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
                            {banner.imageUrl ? (
                                <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon size={24} />
                                </div>
                            )}
                            <span className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                                {banner.alignInfo || 'Left'} Align
                            </span>
                        </div>
                    </td>

                    {/* Details */}
                    <td className="p-4 align-middle">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 text-sm mb-1">{banner.title || 'No Title'}</span>
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit font-medium">
                                {banner.category || 'Uncategorized'}
                            </span>
                            {banner.subCategory && <span className="text-[10px] text-gray-400 mt-1">{banner.subCategory}</span>}
                        </div>
                    </td>

                    {/* Price */}
                    <td className="p-4 align-middle">
                        {banner.price ? (
                            <span className="font-bold text-gray-700">₹{banner.price}</span>
                        ) : (
                            <span className="text-xs text-gray-400 italic">N/A</span>
                        )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right align-middle">
                        <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(banner.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
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