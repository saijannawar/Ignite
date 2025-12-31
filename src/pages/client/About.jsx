import React from 'react';
import { ShoppingBag, Truck, Phone, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-20">
      
      {/* Hero Section */}
      <div className="bg-[#7D2596] text-white py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About ClassyShop</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Your one-stop destination for premium electronics, components, and lifestyle products.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        
        {/* Mission Statement */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            At <strong>ClassyShop</strong>, we believe in making technology and quality products accessible to everyone. 
            Whether you are a hobbyist looking for electronic components, a student working on a project, or someone looking for the latest gadgets, 
            we strive to provide the best quality at the most affordable prices. We are committed to customer satisfaction, fast delivery, 
            and a seamless shopping experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-[#F4EAFB] text-[#7D2596] rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Huge Variety</h3>
            <p className="text-sm text-gray-500">From electronics to lifestyle, we have everything you need.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-[#F4EAFB] text-[#7D2596] rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck size={28} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Fast Delivery</h3>
            <p className="text-sm text-gray-500">Quick shipping across India with reliable tracking.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-[#F4EAFB] text-[#7D2596] rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={28} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Quality Assured</h3>
            <p className="text-sm text-gray-500">100% genuine products sourced from trusted manufacturers.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 bg-[#F4EAFB] text-[#7D2596] rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={28} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Support</h3>
            <p className="text-sm text-gray-500">Dedicated support to help you with your projects.</p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Have Questions?</h2>
          <p className="text-gray-600 mb-6">We'd love to hear from you. Reach out to us for any queries.</p>
          <a 
            href="https://wa.me/919011401920" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#7D2596] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#631d76] transition-colors"
          >
            Contact via WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
};

export default About;