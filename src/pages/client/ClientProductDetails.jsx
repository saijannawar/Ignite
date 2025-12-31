import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
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
  ShieldCheck
} from 'lucide-react';

// --- DUMMY DATA ---
const DUMMY_PRODUCT = {
  id: 123,
  name: "Premium Smart Watch D116 Touchscreen Bluetooth",
  brand: "Morden",
  category: "Electronics",
  sku: "MW-112-D",
  // Note: We don't hardcode rating anymore, we calculate it from reviews
  price: 1500,
  oldPrice: 2100,
  stock: 45,
  description: "Experience the future on your wrist. This smart watch features a high-definition touchscreen, long-lasting battery life, and seamless Bluetooth connectivity. Perfect for fitness tracking, notifications, and everyday style.",
  images: [
    "https://m.media-amazon.com/images/I/61s7sJEpsVL._SX679_.jpg", 
    "https://m.media-amazon.com/images/I/61ZjlBOp+rL._AC_SX679_.jpg", 
    "https://m.media-amazon.com/images/I/51+i+R9-GRL._AC_SX679_.jpg"
  ],
  reviews: [
    { user: "John Doe", rating: 5, comment: "Amazing watch, battery lasts long!", date: "10 Oct 2023" },
    { user: "Sarah Smith", rating: 4, comment: "Good for the price, but strap is stiff.", date: "12 Oct 2023" },
    { user: "Mike R.", rating: 5, comment: "Excellent value for money.", date: "15 Oct 2023" }
  ]
};

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(DUMMY_PRODUCT);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // State for calculated stats
  const [averageRating, setAverageRating] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);

  // 1. Initialize Data & Calculations
  useEffect(() => {
    // In a real app, you would fetch by ID here
    const data = DUMMY_PRODUCT; 
    setProduct(data);

    if (data.images?.length > 0) setMainImage(data.images[0]);

    // Calculate Average Rating
    if (data.reviews && data.reviews.length > 0) {
      const total = data.reviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = total / data.reviews.length;
      setAverageRating(parseFloat(avg.toFixed(1))); // Round to 1 decimal
    }

    // Calculate Discount Percentage
    if (data.oldPrice && data.price) {
      const discount = ((data.oldPrice - data.price) / data.oldPrice) * 100;
      setDiscountPercentage(Math.round(discount));
    }
  }, [id]);

  // Helper to render stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={`${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} 
      />
    ));
  };

  if (!product) return <div className="min-h-screen flex items-center justify-center text-[#ff4d4d]">Loading...</div>;

  return (
    <div className="bg-white min-h-screen font-sans text-gray-700">
      
      {/* 1. BREADCRUMBS */}
      <div className="bg-gray-50 py-4 border-b border-gray-100">
        <div className="container mx-auto px-4 max-w-7xl flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
           <Link to="/" className="hover:text-[#ff4d4d]">Home</Link> 
           <ChevronRight size={12}/>
           <Link to="/shop" className="hover:text-[#ff4d4d]">{product.category}</Link> 
           <ChevronRight size={12}/>
           <span className="text-gray-800 truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* ================= LEFT COLUMN: IMAGES ================= */}
          <div className="lg:w-1/2">
            <div className="sticky top-24 flex gap-4">
              {/* Thumbnails (Left Side) */}
              <div className="hidden sm:flex flex-col gap-4">
                {product.images?.map((img, idx) => (
                  <div 
                    key={idx} 
                    onMouseEnter={() => setMainImage(img)}
                    className={`w-20 h-20 border rounded-lg cursor-pointer p-2 bg-white transition-all duration-300 ${mainImage === img ? 'border-[#ff4d4d] ring-1 ring-[#ff4d4d]/30' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <img src={img} className="w-full h-full object-contain" alt="thumb" />
                  </div>
                ))}
              </div>

              {/* Main Image Display */}
              <div className="flex-1 bg-white border border-gray-100 rounded-2xl relative flex items-center justify-center p-6 min-h-[400px] lg:min-h-[500px] group overflow-hidden">
                <img src={mainImage} className="max-w-full max-h-[400px] object-contain transition-transform duration-500 group-hover:scale-105" alt="Main Product" />
                
                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-[#ff4d4d] text-white text-xs font-bold px-3 py-1 rounded shadow-sm">
                    -{discountPercentage}%
                  </div>
                )}
                
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-[#ff4d4d] transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
            
            {/* Mobile Thumbnails (Horizontal) */}
            <div className="flex sm:hidden gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
               {product.images?.map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setMainImage(img)}
                    className={`min-w-[70px] h-[70px] border rounded-lg cursor-pointer p-1 bg-white ${mainImage === img ? 'border-[#ff4d4d]' : 'border-gray-200'}`}
                  >
                    <img src={img} className="w-full h-full object-contain" alt="thumb" />
                  </div>
                ))}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: INFO ================= */}
          <div className="lg:w-1/2">
            
            {/* Title & Brand */}
            <div className="mb-4">
              <span className="text-[#ff4d4d] text-xs font-bold uppercase tracking-wider mb-2 block">{product.brand}</span>
              <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-3">{product.name}</h1>
              
              {/* Reviews & Stock */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                   {renderStars(averageRating)}
                   <span className="text-sm text-gray-500 font-medium ml-2">({product.reviews?.length} Reviews)</span>
                </div>
                <div className="w-px h-4 bg-gray-300"></div>
                <span className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                   {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Price Block */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-end gap-3 mb-2">
                <span className="text-4xl font-bold text-[#ff4d4d]">₹{product.price}</span>
                <span className="text-xl text-gray-400 line-through mb-1">₹{product.oldPrice}</span>
              </div>
              <p className="text-xs text-gray-500">Inclusive of all taxes</p>
            </div>

            {/* Short Description */}
            <p className="text-gray-600 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Actions: Quantity & Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Quantity Counter */}
              <div className="flex items-center border border-gray-300 rounded-lg h-12 w-36 bg-white overflow-hidden">
                 <button 
                   onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                   className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 active:bg-gray-200 transition"
                 >
                   <Minus size={16} />
                 </button>
                 <div className="flex-1 text-center font-bold text-gray-800 text-lg border-x border-gray-100 flex items-center justify-center h-full">
                   {quantity}
                 </div>
                 <button 
                   onClick={() => setQuantity(quantity + 1)} 
                   className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500 active:bg-gray-200 transition"
                 >
                   <Plus size={16} />
                 </button>
              </div>

              {/* Add To Cart - Outlined Style matching screenshot */}
              <button className="flex-1 h-12 px-6 border-2 border-[#ff4d4d] text-[#ff4d4d] hover:bg-[#ff4d4d] hover:text-white text-sm font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-all duration-300">
                <ShoppingCart size={18} /> Add To Cart
              </button>
              
              {/* Buy Now - Filled */}
               <button className="flex-1 h-12 px-6 bg-[#ff4d4d] text-white hover:bg-red-600 text-sm font-bold uppercase rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-red-100">
                Buy Now
              </button>
            </div>

            {/* Wishlist / Compare */}
            <div className="flex items-center gap-6 mb-8 text-sm font-semibold text-gray-500">
              <button className="flex items-center gap-2 hover:text-[#ff4d4d] transition-colors">
                <Heart size={18} /> Add to Wishlist
              </button>
              <button className="flex items-center gap-2 hover:text-[#ff4d4d] transition-colors">
                <Repeat size={18} /> Compare
              </button>
            </div>

            {/* Service Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-3">
                   <Truck size={24} className="text-[#ff4d4d]" />
                   <div>
                      <p className="text-sm font-bold text-gray-800">Free Shipping</p>
                      <p className="text-[10px] text-gray-500">On all orders over ₹500</p>
                   </div>
                </div>
                 <div className="flex items-center gap-3">
                   <ShieldCheck size={24} className="text-[#ff4d4d]" />
                   <div>
                      <p className="text-sm font-bold text-gray-800">Secure Payment</p>
                      <p className="text-[10px] text-gray-500">100% Protected</p>
                   </div>
                </div>
                 <div className="flex items-center gap-3">
                   <CheckCircle size={24} className="text-[#ff4d4d]" />
                   <div>
                      <p className="text-sm font-bold text-gray-800">Quality Check</p>
                      <p className="text-[10px] text-gray-500">Certified Products</p>
                   </div>
                </div>
            </div>

          </div>
        </div>

        {/* ================= BOTTOM SECTION: TABS ================= */}
        <div className="mt-20">
          {/* Tab Headers */}
          <div className="flex justify-center border-b border-gray-200 mb-10">
            <div className="flex gap-10">
              <button 
                onClick={() => setActiveTab('description')}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-all relative ${activeTab === 'description' ? 'text-[#ff4d4d] border-b-2 border-[#ff4d4d]' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`pb-4 text-sm font-bold uppercase tracking-wide transition-all relative ${activeTab === 'reviews' ? 'text-[#ff4d4d] border-b-2 border-[#ff4d4d]' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Reviews ({product.reviews?.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'description' ? (
              <div className="prose prose-gray max-w-none">
                <p>{product.description}</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <ul>
                    <li>High quality material</li>
                    <li>Durable and long lasting</li>
                    <li>Modern design</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Average Summary */}
                <div className="bg-gray-50 p-6 rounded-xl flex items-center gap-6 mb-8">
                    <div className="text-center">
                        <span className="block text-5xl font-extrabold text-gray-800">{averageRating}</span>
                        <div className="flex justify-center my-2">{renderStars(averageRating)}</div>
                        <span className="text-xs text-gray-500">{product.reviews?.length} Reviews</span>
                    </div>
                    <div className="h-16 w-px bg-gray-200 hidden sm:block"></div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-2">Based on {product.reviews?.length} comments</p>
                        {/* Dummy Progress bars for distribution */}
                        <div className="space-y-1">
                            {[5,4,3,2,1].map(num => (
                                <div key={num} className="flex items-center gap-2 text-xs">
                                    <span className="w-2">{num}</span> <Star size={10} className="text-gray-400"/>
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400" style={{width: num === 5 ? '70%' : num === 4 ? '20%' : '5%'}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#ff4d4d]/10 text-[#ff4d4d] flex items-center justify-center font-bold text-lg">
                            {review.user.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-bold text-gray-900">{review.user}</h4>
                                <span className="text-xs text-gray-400">{review.date}</span>
                            </div>
                            <div className="flex mb-2">
                               {renderStars(review.rating)}
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 italic text-center py-10">No reviews yet for this product.</p>
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