import React from 'react';
import PropTypes from 'prop-types';
import ClientProductCard from '../client/ClientProductCard'; // Adjust path to where you saved the card

const ProductShowcase = ({ products, skeletonCount, isLoading }) => {
  
  // 1. Loading State: Render Skeletons
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {new Array(skeletonCount).fill(0).map((_, index) => (
          <ProductSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // 2. Empty State: Render Message
  if (!products || products.length === 0) {
    return (
      <div className="w-full py-12 text-center border border-dashed border-gray-200 rounded-xl bg-gray-50">
        <p className="text-gray-500 font-medium">No products found.</p>
      </div>
    );
  }

  // 3. Data State: Render Grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ClientProductCard 
          key={product.id} 
          product={product} 
        />
      ))}
    </div>
  );
};

// --- Internal Skeleton Component (Visual Placeholder) ---
const ProductSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm animate-pulse">
    {/* Image Placeholder */}
    <div className="aspect-[3/4] w-full bg-gray-200" />
    
    {/* Content Placeholder */}
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" /> {/* Category */}
      <div className="h-4 bg-gray-200 rounded w-3/4" /> {/* Title */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-gray-200 rounded w-1/4" /> {/* Price */}
        <div className="h-4 bg-gray-200 rounded w-1/5" /> {/* Rating */}
      </div>
    </div>
  </div>
);

ProductShowcase.defaultProps = {
  skeletonCount: 4,
  isLoading: false,
  products: []
};

ProductShowcase.propTypes = {
  products: PropTypes.array,
  skeletonCount: PropTypes.number,
  isLoading: PropTypes.bool
};

export default ProductShowcase;