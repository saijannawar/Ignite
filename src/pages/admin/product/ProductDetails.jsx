import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Tag, Layers, Settings, CheckCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });
          // Set initial active image (either from array or single url)
          setActiveImage(data.images?.[0] || data.imageUrl || '');
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading Details...</div>;
  if (!product) return <div className="p-10 text-center">Product not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200">
          Published
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="w-full h-[400px] bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden relative group">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images && product.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${activeImage === img ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Tag size={14} /> {product.categoryName}</span>
                <span className="flex items-center gap-1"><Layers size={14} /> {product.subCategoryName || 'General'}</span>
              </div>
            </div>

            <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
               <span className="text-3xl font-bold text-[#3b82f6]">₹{product.price}</span>
               {product.oldPrice > 0 && (
                 <span className="text-lg text-gray-400 line-through mb-1">₹{product.oldPrice}</span>
               )}
               {product.discount > 0 && (
                 <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded mb-2">
                   {product.discount}% OFF
                 </span>
               )}
            </div>

            <div className="space-y-4">
               <div className="flex gap-2">
                 <span className="w-24 text-gray-500 text-sm font-medium flex items-center gap-2"><Settings size={14}/> Brand:</span>
                 <span className="text-gray-800 font-medium">{product.brand || 'N/A'}</span>
               </div>
               
               <div className="flex gap-2">
                 <span className="w-24 text-gray-500 text-sm font-medium flex items-center gap-2"><CheckCircle size={14}/> Stock:</span>
                 <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-500'} font-bold`}>
                   {product.stock > 0 ? `${product.stock} Items` : 'Out of Stock'}
                 </span>
               </div>

               <div className="flex gap-2">
                 <span className="w-24 text-gray-500 text-sm font-medium flex items-center gap-2"><Star size={14}/> Rating:</span>
                 <div className="flex text-yellow-400">
                   {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < (product.rating || 0) ? "currentColor" : "none"} />
                   ))}
                   <span className="text-gray-400 text-xs ml-2 pt-0.5">(10 Reviews)</span>
                 </div>
               </div>

               <div className="flex gap-2">
                 <span className="w-24 text-gray-500 text-sm font-medium flex items-center gap-2"><Calendar size={14}/> Date:</span>
                 <span className="text-gray-800 text-sm">
                   {product.createdAt?.seconds ? new Date(product.createdAt.seconds * 1000).toLocaleDateString() : 'Just Now'}
                 </span>
               </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide">Product Description</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {product.description || "No description provided."}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}