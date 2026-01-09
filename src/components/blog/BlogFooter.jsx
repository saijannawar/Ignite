import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, MessageCircle } from 'lucide-react';
// ✅ Import Logo (Adjust path if needed)
import viteLogo from '/vite.svg'; 

export default function BlogFooter() {
  
  const handleWhatsAppRedirect = () => {
    // Redirect to WhatsApp for project submission
    window.open('https://wa.me/919011401920', '_blank');
  };

  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-24 md:pb-8 font-sans border-t border-gray-800">
      <div className="container mx-auto px-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* 1. Brand & Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <img src={viteLogo} alt="Ignite Logo" className="w-8 h-8 object-contain" />
                <h2 className="text-2xl font-extrabold tracking-wide">
                IGNITE <span className="text-[#7D2596]">INSIGHTS</span>
                </h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Empowering engineering students with technical knowledge, project guides, and the latest trends in robotics & IoT.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/ignite.tech?utm_source=qr&igsh=azhoaWJ6cGw3b2pj" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-[#7D2596] transition-colors group"
                aria-label="Instagram"
              >
                <Instagram size={18} className="text-white group-hover:scale-110 transition-transform"/>
              </a>
              <a 
                href="#" 
                className="bg-gray-800 p-2 rounded-full hover:bg-[#0077b5] transition-colors group"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} className="text-white group-hover:scale-110 transition-transform"/>
              </a>
            </div>
          </div>

          {/* 2. Quick Links (Responsive) */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2 inline-block">Explore</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/blogs" className="hover:text-[#7D2596] transition-colors block py-1">Latest Articles</Link></li>
              <li><Link to="/shop" className="hover:text-[#7D2596] transition-colors block py-1">Buy Components</Link></li>
              <li><Link to="/about" className="hover:text-[#7D2596] transition-colors block py-1">About Ignite</Link></li>
            </ul>
          </div>

          {/* 3. Submit Project (WhatsApp) */}
          <div>
            <h3 className="text-lg font-bold mb-6 border-b border-gray-700 pb-2 inline-block">Share Your Project</h3>
            <p className="text-gray-400 text-sm mb-4">
                Have an innovative idea or a completed project? Share it with us directly!
            </p>
            
            <button 
                onClick={handleWhatsAppRedirect}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
            >
                <MessageCircle size={20} />
                <span>Submit via WhatsApp</span>
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
                We review submissions within 24 hours.
            </p>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-800 pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Ignite Insights. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs font-bold text-gray-500">
             <Link to="/" className="hover:text-white transition-colors">Main Store</Link>
             <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}