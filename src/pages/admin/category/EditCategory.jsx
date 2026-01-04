import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Loader, Save } from 'lucide-react';
import { getCategoryById, updateCategory, uploadCategoryImage } from '../../../services/categoryService';

export default function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  // Fetch Data
  useEffect(() => {
    const fetchCat = async () => {
      try {
        const data = await getCategoryById(id);
        if (data) {
          setName(data.name);
          setCurrentImageUrl(data.imageUrl);
        } else {
          alert("Category not found");
          navigate('/admin/category');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCat();
  }, [id, navigate]);

  // Handle Update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = currentImageUrl;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadCategoryImage(imageFile);
      }

      await updateCategory(id, {
        name,
        imageUrl,
      });

      alert("Category Updated!");
      navigate('/admin/category');
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex justify-center items-center"><Loader className="animate-spin text-[#7D2596]" /></div>;

  return (
    <div className="max-w-xl mx-auto space-y-6 mt-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
        <h2 className="text-xl font-bold text-gray-800">Edit Category</h2>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border rounded-lg outline-none focus:border-[#7D2596]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category Image</label>
            
            {/* Image Preview */}
            <div className="mb-4 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-4 h-40">
                <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : currentImageUrl} 
                    alt="Preview" 
                    className="h-full object-contain"
                />
            </div>

            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-[#7D2596]">
                <Upload size={24} />
                <span className="text-xs font-bold uppercase tracking-wide">Click to Change Image</span>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-3 bg-[#7D2596] text-white font-bold rounded-lg hover:bg-[#631d76] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Update Category'}
          </button>

        </form>
      </div>
    </div>
  );
}