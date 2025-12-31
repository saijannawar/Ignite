import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Repeat, 
  Search, 
  Plus, 
  Minus,
  ChevronRight,
  Loader,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import Auth to get current user

// Import Services
import { getProductById, addProductReview, addToWishlist } from '../../services/productService'; 

export default function ProductDetails() {
  const { id } = useParams(); 
  const { currentUser } = useAuth(); // Get logged in user
  const navigate = useNavigate();

  // Data State
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [submitting, setSubmitting] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // --- 1. FETCH PRODUCT DATA ---
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id); 
        if (data) {
          setProduct(data);
          if (data.images && data.images.length > 0) setMainImage(data.images[0]);
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProductData();
  }, [id]);

  // --- 2. HANDLE ADD REVIEW ---
  const handleSubmitReview = async () => {
    if (!currentUser) {
      alert("Please login to write a review");
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) return alert("Please write a comment");

    setSubmitting(true);
    const newReview = {
      user: currentUser.displayName || currentUser.email || "Anonymous",
      userId: currentUser.uid,
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };

    try {
      await addProductReview(id, newReview);
      
      // Update local state instantly
      const updatedReviews = [...(product.reviews || []), newReview];
      setProduct({ ...product, reviews: updatedReviews });
      
      // Reset Form
      setReviewComment("");
      setReviewRating(5);
      alert("Review submitted successfully!");
    } catch (error) {
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // --- 3. HANDLE ADD TO WISHLIST ---
  const handleAddToWishlist = async () => {
    if (!currentUser) {
      alert("Please login to add to wishlist");
      return;
    }
    try {
      await addToWishlist(currentUser.uid, product);
      alert("Product added to wishlist!");
    } catch (error) {
      alert("Failed to add to wishlist");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin text-red-500" /></div>;
  if (!product) return <div className="p-20 text-center">Product not found.</div>;

  return (
    <div className="bg-white min-h-screen font-sans text-gray-800">
      
      {/* Breadcrumbs */}
      <div className="bg-[#f8f9fa] py-4 border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
           <Link to="/" className="hover:text-black">Home</Link> <ChevronRight size={12}/>
           <span className="text-gray-800 truncate max-w-[300px]">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {/* Top Section (Image & Info) */}
        <div className="flex flex-col lg:flex-row gap-10 mb-16">
          
          {/* LEFT: Image Gallery */}
          <div className="lg:w-[45%] flex gap-4">
            <div className="flex flex-col gap-3">
              {product.images?.map((img, idx) => (
                <div key={idx} onMouseEnter={() => setMainImage(img)} className={`w-16 h-16 border rounded cursor-pointer p-1 bg-white ${mainImage === img ? 'border-gray-800' : 'border-gray-200 opacity-60'}`}>
                  <img src={img} className="w-full h-full object-contain" alt="thumb" />
                </div>
              ))}
            </div>
            <div className="flex-1 border border-gray-100 rounded-lg flex items-center justify-center p-5 bg-white min-h-[400px]">
              <img src={mainImage} className="max-w-full max-h-[450px] object-contain" alt="main" />
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:w-[55%] space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-500">Brand: <b>{product.brand || 'N/A'}</b></span>
              <div className="flex text-yellow-400">
                 {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < (product.rating || 0) ? "currentColor" : "none"} strokeWidth={0} className={i >= (product.rating||0) ? "text-gray-200" : ""} />)}
              </div>
              <span className="text-gray-400 text-xs">({product.reviews?.length || 0} Reviews)</span>
            </div>

            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
              {product.oldPrice > 0 && <span className="text-xl text-gray-400 line-through">₹{product.oldPrice}</span>}
              <span className="text-3xl font-bold text-[#ff4d4d]">₹{product.price}</span>
              <span className="bg-green-50 text-green-600 px-2 py-1 text-xs font-bold uppercase rounded">In Stock: {product.stock}</span>
            </div>

            <p className="text-gray-500 text-sm">{product.description}</p>

            {/* Quantity & Cart */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-gray-300 rounded h-12 w-32 bg-white">
                 <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center"><Minus size={14}/></button>
                 <span className="flex-1 text-center font-bold text-sm">{quantity}</span>
                 <button onClick={() => setQuantity(Math.min(quantity + 1, product.stock))} className="w-10 h-full flex items-center justify-center"><Plus size={14}/></button>
              </div>
              <button className="h-12 px-8 bg-[#ff4d4d] text-white font-bold rounded flex items-center gap-2 hover:bg-red-600 shadow-lg shadow-red-100">
                <ShoppingCart size={18} /> Add To Cart
              </button>
            </div>

            {/* Wishlist Button */}
            <div className="flex gap-6 pt-2">
              <button onClick={handleAddToWishlist} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#ff4d4d]">
                <Heart size={16} /> Add to Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* --- TABS SECTION (Description & Reviews) --- */}
        <div className="mt-16">
          <div className="flex gap-10 border-b border-gray-200 mb-8">
            <button onClick={() => setActiveTab('description')} className={`pb-4 text-lg font-bold border-b-2 transition-all ${activeTab === 'description' ? 'text-[#ff4d4d] border-[#ff4d4d]' : 'text-gray-400 border-transparent'}`}>Description</button>
            <button onClick={() => setActiveTab('reviews')} className={`pb-4 text-lg font-bold border-b-2 transition-all ${activeTab === 'reviews' ? 'text-[#ff4d4d] border-[#ff4d4d]' : 'text-gray-400 border-transparent'}`}>Reviews ({product.reviews?.length || 0})</button>
          </div>

          <div className="p-8 border border-gray-100 rounded-xl bg-white shadow-sm">
            {activeTab === 'description' ? (
              <p className="text-gray-600 leading-relaxed">{product.description || "No description."}</p>
            ) : (
              <div className="space-y-8">
                {/* Existing Reviews List */}
                {product.reviews && product.reviews.map((rev, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">{rev.user.charAt(0)}</div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">{rev.user}</h4>
                          <span className="text-xs text-gray-400">{rev.date}</span>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < rev.rating ? "currentColor" : "none"} strokeWidth={0} className={i >= rev.rating ? "text-gray-200" : ""} />)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm pl-[52px]">{rev.comment}</p>
                  </div>
                ))}

                {/* --- ADD REVIEW FORM (Matches Screenshot) --- */}
                <div className="bg-gray-50 p-6 rounded-lg mt-6">
                  <h3 className="font-bold text-gray-800 mb-4">Add a review</h3>
                  
                  {/* Rating Selector */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-gray-600">Your Rating:</span>
                    <div className="flex text-gray-300 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={20} 
                          fill={star <= reviewRating ? "#fbbf24" : "none"} 
                          stroke={star <= reviewRating ? "#fbbf24" : "currentColor"}
                          onClick={() => setReviewRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment Input */}
                  <textarea 
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-[#ff4d4d] text-sm bg-white"
                    rows="4"
                    placeholder="Write a review..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  ></textarea>

                  {/* Submit Button */}
                  <button 
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="mt-4 px-6 py-3 bg-[#ff4d4d] text-white font-bold text-sm rounded hover:bg-red-600 transition-colors uppercase shadow-md"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}