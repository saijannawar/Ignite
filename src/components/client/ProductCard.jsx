import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext'; 

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart(); 

  // 1. Image Resolution
  const imageSource = product.imageUrl || (product.images && product.images[0]) || product.img || 'https://via.placeholder.com/300';

  // 2. Calculate Discount
  const originalPrice = Number(product.originalPrice) || 0;
  const price = Number(product.price) || 0;
  
  let discountPercentage = 0;
  if (originalPrice > price) {
    discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  const ratingValue = product.rating || 0;

  // Function to handle Add to Cart
  const handleAddToCart = (e) => {
    e.preventDefault(); 
    addToCart(product);
  };

  // --- LIST VIEW LAYOUT (Horizontal) ---
  if (viewMode === 'list') {
    return (
      <div className="group w-full flex border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
        {/* Image (Left) */}
        <div className="relative w-1/3 min-w-[120px] md:min-w-[200px] bg-gray-50 flex-shrink-0">
             {discountPercentage > 0 && (
                <span className="absolute top-2 left-2 bg-[#7D2596] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                  {discountPercentage}%
                </span>
             )}
             {/* ✅ LINK TO DETAILS PAGE */}
             <Link to={`/product/${product.id}`} className="block h-full w-full">
                <img src={imageSource} alt={product.name} className="h-full w-full object-contain p-2 hover:scale-105 transition-transform duration-500" />
             </Link>
        </div>

        {/* Content (Right) */}
        <div className="p-4 flex flex-col flex-grow">
           <p className="text-xs text-gray-500 mb-1">{product.brand || 'Brand'}</p>
           
           {/* ✅ LINK TO DETAILS PAGE */}
           <Link to={`/product/${product.id}`}>
              <h3 className="text-base font-semibold text-gray-800 hover:text-[#7D2596] mb-2 line-clamp-2">{product.name}</h3>
           </Link>
           
           <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.round(ratingValue) ? "currentColor" : "none"} className={i < Math.round(ratingValue) ? "text-yellow-400" : "text-gray-300"} />
              ))}
              <span className="text-xs text-gray-400">({product.reviews || 0})</span>
           </div>

           <div className="mt-auto flex items-center justify-between">
              <div className="flex flex-col">
                 {originalPrice > price && <span className="text-xs text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>}
                 <span className="text-lg font-bold text-[#7D2596]">₹{price.toLocaleString()}</span>
              </div>
              <button 
                  className="bg-[#7D2596] text-white p-2 rounded-lg hover:bg-[#631d76] transition-colors shadow-sm flex items-center gap-2 text-sm font-medium px-4"
                  onClick={handleAddToCart}
              >
                  <ShoppingCart size={16} /> Add
              </button>
           </div>
        </div>
      </div>
    );
  }

  // --- GRID VIEW LAYOUT (Vertical - Default) ---
  return (
    <div className="group w-full h-full flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300">
      <div className="relative p-3 md:p-4 flex-shrink-0">
        {discountPercentage > 0 && (
          <span className="absolute top-3 left-3 bg-[#7D2596] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10 shadow-sm">
            {discountPercentage}%
          </span>
        )}
        
        {/* ✅ LINK TO DETAILS PAGE */}
        <Link to={`/product/${product.id}`} className="block overflow-hidden rounded-lg">
          <img
            src={imageSource}
            alt={product.name}
            className="mx-auto h-32 sm:h-40 md:h-52 w-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
      </div>

      <div className="px-3 md:px-4 pb-3 md:pb-4 flex flex-col flex-grow space-y-1.5">
        <p className="text-[10px] md:text-xs text-gray-500 font-medium">{product.brand || 'Brand'}</p>
        
        {/* ✅ LINK TO DETAILS PAGE */}
        <Link to={`/product/${product.id}`} className="block">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-[#7D2596] transition-colors h-8 md:h-10 overflow-hidden">
            {product.name}
            </h3>
        </Link>

        <div className="flex items-center gap-0.5 text-yellow-400">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill={i < Math.round(ratingValue) ? "currentColor" : "none"} className={i < Math.round(ratingValue) ? "text-yellow-400" : "text-gray-300"} />
            ))}
        </div>

        <div className="flex items-center gap-2 mt-auto pt-1">
          {originalPrice > price && (
             <span className="text-gray-400 line-through text-[10px] md:text-xs font-medium">₹{originalPrice.toLocaleString()}</span>
          )}
          <span className="text-[#7D2596] font-bold text-sm md:text-lg">₹{price.toLocaleString()}</span>
        </div>

        <button 
            className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg border border-[#7D2596] text-[#7D2596] font-bold text-[10px] md:text-[13px] py-2 hover:bg-[#7D2596] hover:text-white transition-all duration-200 active:scale-95"
            onClick={handleAddToCart}
        >
          <ShoppingCart size={14} className="md:w-4 md:h-4" strokeWidth={2.5} />
          ADD
        </button>
      </div>
    </div>
  );
};

export default ProductCard;