import React, { useEffect, useState } from 'react';
import { getBanners, deleteBanner } from '../../../services/productService';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function BannerList2() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch only type 'home_2'
  const fetchBanners = async () => {
    const data = await getBanners('home_2');
    setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Delete this banner?")) {
      await deleteBanner(id);
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  return (
    <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Banners List</h1>
        <Link to="/admin/banners/home-2/add" className="bg-[#3b82f6] text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-blue-700 shadow-md uppercase">
          Add Banner
        </Link>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-xs font-bold text-gray-600 uppercase border-b border-gray-200">
            <tr>
              <th className="p-4 w-3/4">Image</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td className="p-4">Loading...</td></tr> : banners.map((banner) => (
              <tr key={banner.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="bg-gray-100 rounded-lg p-2 inline-block border border-gray-200">
                    <img src={banner.imageUrl} alt="" className="h-24 w-48 object-cover" />
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button className="text-gray-500 hover:text-blue-600"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(banner.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}