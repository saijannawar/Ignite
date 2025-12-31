import React, { useState, useRef } from 'react';
import { Upload, X, Save, Image as ImageIcon, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

const ManageLogo = () => {
  // State for the logo management
  const [currentLogo, setCurrentLogo] = useState("https://via.placeholder.com/150"); // Replace with actual initial logo URL
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const fileInputRef = useRef(null);

  // Configuration
  const MAX_FILE_SIZE_MB = 2;
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  // File Validation Logic
  const validateAndSetFile = (file) => {
    setMessage({ type: '', text: '' });

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Please upload PNG, JPG, or SVG.' });
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setMessage({ type: 'error', text: `File size exceeds ${MAX_FILE_SIZE_MB}MB.` });
      return;
    }

    // specific check for image dimensions if needed could go here

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setSelectedFile(file);
  };

  // Handle Save / Upload
  const handleSave = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Simulate API Call
      // const formData = new FormData();
      // formData.append('logo', selectedFile);
      // await axios.post('/api/settings/logo', formData);
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay

      setCurrentLogo(preview); // Update the "real" logo
      setPreview(null);
      setSelectedFile(null);
      setMessage({ type: 'success', text: 'Logo updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload logo. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Delete/Reset
  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessage({ type: '', text: '' });
  };

  // Handle Delete Existing Logo
  const handleDeleteCurrent = async () => {
      if(window.confirm("Are you sure you want to remove the current logo?")) {
          // Add API call here to delete logo
          setCurrentLogo(null);
          setMessage({ type: 'success', text: 'Logo removed successfully.' });
      }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-xl border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Brand Logo</h2>
        <p className="text-gray-500 text-sm mt-1">Upload your organization's logo. Preferred size: 400x400px.</p>
      </div>

      {/* Notification Area */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 text-sm ${
          message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Left Col: Current/Preview Display */}
        <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Preview</h3>
            <div className="relative flex items-center justify-center w-full aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden group">
                {preview ? (
                    <img src={preview} alt="New Logo Preview" className="max-w-full max-h-full object-contain p-4" />
                ) : currentLogo ? (
                    <img src={currentLogo} alt="Current Logo" className="max-w-full max-h-full object-contain p-4" />
                ) : (
                    <div className="text-center text-gray-400">
                        <ImageIcon className="mx-auto mb-2 opacity-50" size={48} />
                        <span className="text-sm">No Logo Set</span>
                    </div>
                )}
                
                {/* Remove Preview Button */}
                {preview && (
                    <button 
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-1.5 bg-white shadow-sm rounded-full text-gray-500 hover:text-red-500 transition-colors"
                        title="Remove preview"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
            
            {/* Delete Existing Button */}
            {!preview && currentLogo && (
                 <button 
                 onClick={handleDeleteCurrent}
                 className="flex items-center justify-center w-full gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm transition-colors"
               >
                 <Trash2 size={16} /> Remove Current Logo
               </button>
            )}
        </div>

        {/* Right Col: Upload Area */}
        <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Upload New</h3>
            
            <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    selectedFile ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={handleFileChange}
                />
                
                <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <Upload size={24} />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-gray-700">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG (max {MAX_FILE_SIZE_MB}MB)</p>
                    </div>
                </div>
            </div>

            {selectedFile && (
                <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between text-sm">
                    <span className="truncate max-w-[200px] text-gray-700">{selectedFile.name}</span>
                    <span className="text-gray-400 text-xs">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
            )}

            <div className="pt-4 flex gap-3">
                <button 
                    onClick={handleSave}
                    disabled={!selectedFile || isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white font-medium transition-all ${
                        !selectedFile || isLoading 
                        ? 'bg-gray-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow'
                    }`}
                >
                    {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                    ) : (
                        <>
                          <Save size={18} /> Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLogo;