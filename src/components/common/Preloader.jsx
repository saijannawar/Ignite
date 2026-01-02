import React from 'react';

export default function Preloader({ fullScreen = true, text = "Loading..." }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
        
        {/* Animation Container */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-4">
          
          {/* 1. Spinning Outer Ring */}
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#7D2596] border-t-transparent rounded-full animate-spin"></div>
          
          {/* 2. Pulsing Logo in Center */}
          <div className="relative z-10 animate-pulse">
            <img 
               src="/vite.svg" 
               alt="IgniteNow" 
               className="w-10 h-10 object-contain drop-shadow-md" 
            />
          </div>
        </div>

        {/* 3. Brand Text */}
        <h2 className="text-xl font-extrabold tracking-widest text-gray-800 animate-pulse">
          IGNITE<span className="text-[#7D2596]">NOW</span>
        </h2>
        
        {/* Optional Status Text */}
        {text && <p className="text-xs text-gray-400 font-medium mt-2 uppercase tracking-wide">{text}</p>}
      </div>
    );
  }

  // Small Inline Version (for sections of a page)
  return (
    <div className="flex flex-col items-center justify-center p-10">
      <div className="relative flex items-center justify-center w-12 h-12 mb-3">
        <div className="absolute inset-0 border-2 border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-[#7D2596] border-t-transparent rounded-full animate-spin"></div>
        <img src="/vite.svg" alt="Logo" className="w-5 h-5 object-contain" />
      </div>
      <span className="text-xs font-bold text-gray-400">{text}</span>
    </div>
  );
}