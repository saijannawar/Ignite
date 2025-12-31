import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { getBanners, deleteBanner } from '../../services/bannerService';

export default function HomeBannersList() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Banners
  const fetchBanners = async () => {
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteBanner(id);
        setBanners(banners.filter(b => b.id !== id)); // Remove from UI locally
      } catch (error) {
        alert("Failed to delete banner");
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Home Slider Banners</h2>
        <Link to="/admin/home-slides/add">
          <button className="bg-[#3b82f6] hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium shadow-sm transition-colors">
            ADD HOME SLIDE
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
            <tr>
              <th className="p-4 w-3/4">Image</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="2" className="p-8 text-center text-gray-500">Loading banners...</td></tr>
            ) : banners.length === 0 ? (
              <tr><td colSpan="2" className="p-8 text-center text-gray-500">No banners found.</td></tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <div className="w-64 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-3">
                      <button className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {/* Pagination Footer (Static for now) */}
        <div className="p-3 border-t border-gray-100 flex justify-end text-xs text-gray-500 gap-4">
            <span>Rows per page: 10</span>
            <span>1–10 of {banners.length}</span>
        </div>
      </div>
    </div>
  );
}