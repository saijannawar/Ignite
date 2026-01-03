import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Repeat, 
  Share2, 
  Plus, 
  Minus,
  ChevronRight,
  CheckCircle,
  Truck,
  ShieldCheck,
  Loader,
  User
} from 'lucide-react';

import { doc, updateDoc, arrayUnion, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase"; 

import { getProductById } from '../../services/productService';
import { useCart } from '../../context/CartContext'; 
import { useAuth } from '../../context/AuthContext'; 

export default function ClientProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); 
  const { addToCart } = useCart(); 
  const { currentUser } = useAuth(); 
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [categoryName, setCategoryName] = useState(""); 
  
  // Stats
  const [averageRating, setAverageRating] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // Review Form State
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wishlist State
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // 1. Fetch Data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          const firstImage = data.imageUrl || (data.images && data.images.length > 0 ? data.images[0] : 'https://via.placeholder.com/400');
          setMainImage(firstImage);
          calculateStats(data);

          if (data.category) {
            try {
              const catRef = doc(db, "categories", data.category);
              const catSnap = await getDoc(catRef);
              if (catSnap.exists()) {
                setCategoryName(catSnap.data().name);
              } else {
                setCategoryName(data.category);
              }
            } catch (err) {
              setCategoryName(data.category);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  // 2. Check if item is already in Wishlist
  useEffect(() => {
    const checkWishlist = async () => {
        if (currentUser && product) {
            try {
                const wishlistRef = doc(db, "users", currentUser.uid, "wishlist", product.id);
                const docSnap = await getDoc(wishlistRef);
                if (docSnap.exists()) {
                    setInWishlist(true);
                }
            } catch (error) {
                console.error("Wishlist check error:", error);
            }
        }
    };
    checkWishlist();
  }, [currentUser, product]);

  const calculateStats = (data) => {
    if (data.reviews && data.reviews.length > 0) {
      const total = data.reviews.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0);
      const avg = total / data.reviews.length;
      setAverageRating(parseFloat(avg.toFixed(1)));
    } else {
       setAverageRating(Number(data.rating) || 0);
    }

    const price = Number(data.price) || 0;
    const originalPrice = Number(data.originalPrice) || 0;
    
    if (originalPrice > price) {
      const discount = ((originalPrice - price) / originalPrice) * 100;
      setDiscountPercentage(Math.round(discount));
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        fill={i < Math.round(rating) ? "#fbbf24" : "none"} 
        className={`${i < Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`} 
      />
    ));
  };

  const handleAddToWishlist = async () => {
    if (!currentUser) {
        alert("Please login to use Wishlist");
        navigate('/login');
        return;
    }
    
    setWishlistLoading(true);
    try {
        const wishlistRef = doc(db, "users", currentUser.uid, "wishlist", product.id);
        
        await setDoc(wishlistRef, {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: mainImage,
            addedAt: serverTimestamp()
        });
        
        setInWishlist(true);
        alert("Added to Wishlist!");
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        alert("Failed to add to wishlist");
    } finally {
        setWishlistLoading(false);
    }
  };

  // ✅ NEW: Handle Share Logic (Mobile Native Share or Clipboard Copy)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Ignite!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      // Fallback for desktop
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleAddToCart = () => {
      if (product) {
          addToCart({ ...product, quantity });
      }
  };

  const handleBuyNow = () => {
    if (!currentUser) {
        alert("Please login to proceed");
        navigate('/login');
        return;
    }
    if (product) {
      addToCart({ ...product, quantity });
      navigate('/cart'); 
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    setIsSubmitting(true);

    const newReview = {
        user: newReviewName,
        rating: newReviewRating,
        comment: newReviewComment,
        date: new Date().toISOString().split('T')[0],
        avatar: "" 
    };

    try {
        const productRef = doc(db, "products", id);
        await updateDoc(productRef, {
            reviews: arrayUnion(newReview)
        });

        setProduct((prevProduct) => {
            const updatedReviews = [newReview, ...(prevProduct.reviews || [])];
            const updatedProduct = { ...prevProduct, reviews: updatedReviews };
            calculateStats(updatedProduct);
            return updatedProduct;
        });

        setNewReviewName("");
        setNewReviewComment("");
        setNewReviewRating(5);
        
    } catch (error) {
        console.error("Error saving review to Firebase:", error);
        alert("Failed to save review. Check your internet connection.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#7D2596]"><Loader className="animate-spin" /></div>;
  
  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500">Product not found.</div>;

  return (
    <div className="bg-white min-h-screen font-sans text-gray-700 pb-24 md:pb-0">
      
      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide overflow-hidden whitespace-nowrap">
           <Link to="/" className="hover:text-[#7D2596]">Home</Link> 
           <ChevronRight size={12}/>
           <Link to={`/shop?category=${categoryName}`} className="hover:text-[#7D2596]">
             {categoryName || 'Loading...'}
           </Link> 
           <ChevronRight size={12}/>
           <span className="text-gray-800 truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: IMAGES */}
          <div className="lg:w-1/2">
            <div className="sticky top-24 flex gap-4 flex-col-reverse sm:flex-row">
              {/* Thumbnails */}
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-hide">
                {product.images && product.images.length > 0 ? (
                    product.images.map((img, idx) => (
                    <div 
                        key={idx} 
                        onMouseEnter={() => setMainImage(img)}
                        onClick={() => setMainImage(img)}
                        className={`min-w-[60px] w-[60px] h-[60px] sm:w-20 sm:h-20 border rounded-lg cursor-pointer p-1 bg-white transition-all duration-300 flex-shrink-0 ${mainImage === img ? 'border-[#7D2596] ring-1 ring-[#7D2596]/30' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                        <img src={img} className="w-full h-full object-contain" alt="thumb" />
                    </div>
                    ))
                ) : (
                    <div className={`min-w-[60px] w-20 h-20 border rounded-lg cursor-pointer p-1 bg-white border-[#7D2596]`}>
                        <img src={product.imageUrl} className="w-full h-full object-contain" alt="thumb" />
                    </div>
                )}
              </div>

              {/* Main Image */}
              <div className="flex-1 bg-white border border-gray-100 rounded-2xl relative flex items-center justify-center p-6 min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] group overflow-hidden">
                <img src={mainImage} className="max-w-full max-h-[300px] sm:max-h-[400px] object-contain transition-transform duration-500 group-hover:scale-105" alt="Main Product" />
                
                {discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-[#7D2596] text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
                    -{discountPercentage}%
                  </div>
                )}
                
                {/* ✅ UPDATED: Responsive Share Button */}
                <button 
                  onClick={handleShare}
                  className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-[#7D2596] hover:scale-110 transition-all active:scale-95"
                  title="Share Product"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: INFO */}
          <div className="lg:w-1/2">
            
            {/* Title & Brand */}
            <div className="mb-3">
              <span className="text-[#7D2596] text-xs font-bold uppercase tracking-wider mb-1 block">{product.brand || 'Brand'}</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                   {renderStars(averageRating)}
                   <span className="text-sm text-gray-500 font-medium ml-2">({product.reviews?.length || 0} Reviews)</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <span className={`text-sm font-bold ${(Number(product.stock) || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                   {(Number(product.stock) || 0) > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div className="border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-4xl font-bold text-[#7D2596]">₹{Number(product.price).toLocaleString()}</span>
                {discountPercentage > 0 && (
                    <span className="text-xl text-gray-400 line-through mb-1">₹{Number(product.originalPrice).toLocaleString()}</span>
                )}
              </div>
              <p className="text-xs text-gray-500">Inclusive of all taxes</p>
            </div>

            {/* Actions: Quantity & Cart */}
            <div className="flex flex-col gap-4 mb-6">
              
              {/* Quantity Counter */}
              <div className="flex items-center border border-gray-300 rounded-lg h-12 w-full sm:w-40 bg-white overflow-hidden">
                 <button 
                   onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                   className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 active:bg-gray-200 transition"
                 >
                   <Minus size={20} />
                 </button>
                 <div className="flex-1 text-center font-bold text-gray-900 text-lg border-x border-gray-100 flex items-center justify-center h-full">
                   {quantity}
                 </div>
                 <button 
                   onClick={() => setQuantity(quantity + 1)} 
                   className="w-12 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 active:bg-gray-200 transition"
                 >
                   <Plus size={20} />
                 </button>
              </div>

              {/* ALIGNED BUTTONS */}
              <div className="flex gap-3 w-full">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 h-12 px-6 border-2 border-[#7D2596] text-[#7D2596] hover:bg-[#7D2596] hover:text-white text-sm font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <ShoppingCart size={18} /> Add To Cart
                  </button>
                  
                   <button 
                    onClick={handleBuyNow}
                    className="flex-1 h-12 px-6 bg-[#7D2596] text-white hover:bg-[#631d76] text-sm font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-purple-100"
                   >
                    Buy Now
                  </button>
              </div>
            </div>

            {/* Wishlist / Compare */}
            <div className="flex items-center gap-6 mb-8 text-sm font-semibold text-gray-500">
              <button 
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
                className={`flex items-center gap-2 transition-colors ${inWishlist ? 'text-red-500' : 'hover:text-[#7D2596]'}`}
              >
                <Heart size={18} fill={inWishlist ? "currentColor" : "none"} /> 
                {inWishlist ? "Saved to Wishlist" : "Add to Wishlist"}
              </button>
              
            </div>

            {/* Service Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-3">
                   <Truck size={24} className="text-[#7D2596]" />
                   <div>
                      <p className="text-sm font-bold text-gray-800">Free Shipping</p>
                      <p className="text-[10px] text-gray-500">On VIT Pune College Pickup</p>
                   </div>
                </div>
                 <div className="flex items-center gap-3">
                   <ShieldCheck size={24} className="text-[#7D2596]" />
                   <div>
                      <p className="text-sm font-bold text-gray-800">Cash On Delivery</p>
                      <p className="text-[10px] text-gray-500">Pay upon receiving</p>
                   </div>
                </div>
                 <div className="flex items-center gap-3">
                   <CheckCircle size={24} className="text-[#7D2596]" />
                   <div>
                      <p className="text-sm font-bold text-gray-800">Quality Check</p>
                      <p className="text-[10px] text-gray-500">Certified Products</p>
                   </div>
                </div>
            </div>

          </div>
        </div>

        {/* BOTTOM SECTION: TABS */}
        <div className="mt-16">
          <div className="flex justify-center border-b border-gray-200 mb-8 overflow-x-auto">
            <div className="flex gap-10 min-w-max px-4">
              <button 
                onClick={() => setActiveTab('description')}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-all relative ${activeTab === 'description' ? 'text-[#7D2596] border-b-2 border-[#7D2596]' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-all relative ${activeTab === 'reviews' ? 'text-[#7D2596] border-b-2 border-[#7D2596]' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Reviews ({product.reviews?.length || 0})
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {activeTab === 'description' ? (
              <div className="prose prose-gray max-w-none text-gray-600">
                <p>{product.description}</p>
                {product.longDescription && (
                    <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
                )}
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Add Review Form */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 shadow-sm">
                   <h3 className="font-bold text-lg text-gray-900 mb-4">Add a review</h3>
                   <form onSubmit={handleSubmitReview}>
                       <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm text-gray-600">Your Rating:</span>
                          <div className="flex">
                            {[1,2,3,4,5].map(star => (
                              <Star 
                                key={star}
                                size={24}
                                onClick={() => setNewReviewRating(star)}
                                className={`cursor-pointer transition-colors ${star <= newReviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                       </div>

                       <div className="mb-4">
                           <input 
                             type="text" 
                             required
                             placeholder="Your Name" 
                             value={newReviewName}
                             onChange={(e) => setNewReviewName(e.target.value)}
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#7D2596] focus:ring-1 focus:ring-[#7D2596]"
                           />
                       </div>

                       <div className="mb-4">
                          <textarea 
                             rows="3"
                             required
                             placeholder="Write your review here..." 
                             value={newReviewComment}
                             onChange={(e) => setNewReviewComment(e.target.value)}
                             className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-[#7D2596] focus:ring-1 focus:ring-[#7D2596]"
                           ></textarea>
                       </div>

                       <button 
                         type="submit" 
                         disabled={isSubmitting}
                         className="px-6 py-2 bg-[#7D2596] text-white font-bold rounded-lg hover:bg-[#631d76] transition-colors disabled:opacity-50"
                       >
                         {isSubmitting ? 'Submitting...' : 'Submit Review'}
                       </button>
                   </form>
                </div>

                {/* Reviews List */}
                <h4 className="font-bold text-xl text-gray-800">Customer Reviews</h4>
                <div className="space-y-6">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                             {review.avatar ? (
                               <img src={review.avatar} alt={review.user} className="w-full h-full object-cover"/>
                             ) : (
                               <User size={24} className="text-gray-400" />
                             )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.user || "Anonymous"}</h4>
                                    <span className="text-xs text-gray-400">{review.date || ""}</span>
                                </div>
                                <div className="flex">
                                   {renderStars(Number(review.rating))}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mt-2">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-center py-10">No reviews yet for this product. Be the first to write one!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}