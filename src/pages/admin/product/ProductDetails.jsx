import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Star, Calendar, Tag, Layers, Settings, CheckCircle, 
  Trash2, User, MessageSquare 
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Added updateDoc
import { db } from '../../../config/firebase';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch Product
  const fetchProduct = async () => {
    try {
      const docRef = doc(db, "products", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct({ id: docSnap.id, ...data });
        setActiveImage(data.imageUrl || (data.images && data.images[0]) || '');
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // ✅ DELETE REVIEW FUNCTION
  const handleDeleteReview = async (reviewIndex) => {
    if(!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      // Filter out the review at the specific index
      const updatedReviews = product.reviews.filter((_, index) => index !== reviewIndex);
      
      const productRef = doc(db, "products", id);
      // Update Firestore with the new reviews array
      await updateDoc(productRef, {
        reviews: updatedReviews
      });

      // Update local state to reflect change immediately
      setProduct(prev => ({ ...prev, reviews: updatedReviews }));
      alert("Review deleted successfully");

    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  if (loading) return <div className="p-10 text-center text-[#7D2596] font-bold">Loading Details...</div>;
  if (!product) return <div className="p-10 text-center text-gray-500">Product not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      
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

      {/* Main Product Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* LEFT: Image Gallery */}
          <div className="space-y-4">
            <div className="w-full h-[400px] bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden relative group">
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="w-full h-full object-contain" />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 overflow-hidden transition-all ${activeImage === img ? 'border-[#7D2596] ring-2 ring-purple-100' : 'border-gray-200 hover:border-gray-300'}`}
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
                <span className="flex items-center gap-1"><Tag size={14} /> {product.categoryName || 'Uncategorized'}</span>
                <span className="flex items-center gap-1"><Layers size={14} /> {product.subCategory || 'General'}</span>
              </div>
            </div>

            <div className="flex items-end gap-3 pb-6 border-b border-gray-100">
               <span className="text-3xl font-bold text-[#7D2596]">₹{product.price}</span>
               {product.originalPrice > 0 && (
                 <span className="text-lg text-gray-400 line-through mb-1">₹{product.originalPrice}</span>
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
                   <span className="text-gray-400 text-xs ml-2 pt-0.5">({product.reviews?.length || 0} Reviews)</span>
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
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg border border-gray-100">
                {product.description || "No description provided."}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ✅ NEW SECTION: Customer Reviews Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <MessageSquare className="text-[#7D2596]" />
            <h3 className="text-lg font-bold text-gray-800">Customer Reviews Management</h3>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                {product.reviews?.length || 0}
            </span>
        </div>

        <div className="divide-y divide-gray-100">
            {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((review, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors group">
                        <div className="flex items-start justify-between">
                            
                            {/* Review Content */}
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#7D2596] font-bold flex-shrink-0">
                                    <User size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-900 text-sm">{review.user || "Anonymous"}</h4>
                                        <span className="text-xs text-gray-400">• {review.date || "Unknown Date"}</span>
                                    </div>
                                    <div className="flex text-yellow-400 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button 
                                onClick={() => handleDeleteReview(index)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Review"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-10 text-center text-gray-400 italic">
                    No reviews yet. When customers review this product, they will appear here.
                </div>
            )}
        </div>
      </div>

    </div>
  );
}