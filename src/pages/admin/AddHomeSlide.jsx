import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, CloudUpload } from 'lucide-react';
import { uploadBannerImage, addBanner } from '../../services/bannerService';

export default function AddHomeSlide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Handle File Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle Publish
  const handlePublish = async () => {
    if (!imageFile) return alert("Please select an image first!");
    
    setLoading(true);
    try {
      const imageUrl = await uploadBannerImage(imageFile);
      await addBanner({ imageUrl });
      navigate('/admin/home-slides'); // Redirect to list after success
    } catch (error) {
      console.error("Error uploading banner:", error);
      alert("Failed to upload banner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-gray-100 p-4 rounded-t-lg border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-700">Add Home Slide</h2>
        <button onClick={() => navigate('/admin/home-slides')}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
      </div>

      {/* Upload Box */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        
        {/* Dashed Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center relative hover:bg-gray-50 transition-colors bg-gray-50/50">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          
          {preview ? (
            <div className="relative h-full w-full p-2">
              <img src={preview} alt="Preview" className="h-full w-full object-contain rounded" />
              <button 
                onClick={(e) => { e.stopPropagation(); setPreview(null); setImageFile(null); }}
                className="absolute top-4 right-4 bg-white p-1 rounded-full shadow-md z-20 hover:bg-red-50 text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                 <Upload size={24} className="text-gray-500" />
              </div>
              <p className="text-sm font-medium text-gray-600">Image Upload</p>
              <p className="text-xs mt-1 text-gray-400">Click to browse or drop file here</p>
            </div>
          )}
        </div>

        {/* Publish Button */}
        <div className="mt-6">
          <button 
            onClick={handlePublish}
            disabled={loading}
            className="bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-2.5 rounded shadow-sm flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Publishing...' : <><CloudUpload size={18} /> PUBLISH AND VIEW</>}
          </button>
        </div>

      </div>
    </div>
  );
}