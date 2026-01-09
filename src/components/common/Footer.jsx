import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  Ban, 
  Banknote, 
  Headset, 
  MessageCircle, 
  MapPin, 
  Mail, 
  Phone,
  Instagram, 
  Twitter,
  Package,
  FileText
} from 'lucide-react';
import { collection, getDocs, limit, query } from 'firebase/firestore'; 
import { db } from '../../config/firebase'; 

const Footer = () => {
  const [categories, setCategories] = useState([]);

  // ✅ Fetch Top 4 Categories Dynamically
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), limit(4));
        const querySnapshot = await getDocs(q);
        const cats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching footer categories:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="bg-[#1a1a1a] border-t border-gray-800 font-sans pb-24 md:pb-0 text-gray-400">
      
      {/* --- TOP FEATURES BAR (Luxury Gradient) --- */}
      <div className="relative bg-gradient-to-b from-[#2a2a2a] via-[#1f1f1f] to-[#121212] border-b border-white/5 overflow-hidden">
        
        {/* Subtle Ambient Light Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-full bg-white/5 blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/5">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-[#333] to-[#1a1a1a] border border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] group-hover:border-[#7D2596]/50 group-hover:shadow-[#7D2596]/20">
                    <Truck size={28} className="text-[#7D2596] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-100 text-sm uppercase tracking-wider mb-1 group-hover:text-[#7D2596] transition-colors">Free Shipping</h4>
                <p className="text-[11px] text-gray-500 font-medium">On VIT Pune College Pickup</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-[#333] to-[#1a1a1a] border border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] group-hover:border-red-500/50 group-hover:shadow-red-500/20">
                    <Ban size={28} className="text-[#7D2596] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-100 text-sm uppercase tracking-wider mb-1 group-hover:text-red-500 transition-colors">No Returns</h4>
                <p className="text-[11px] text-gray-500 font-medium">All Sales Are Final</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-[#333] to-[#1a1a1a] border border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] group-hover:border-green-500/50 group-hover:shadow-green-500/20">
                    <Banknote size={28} className="text-[#7D2596] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-100 text-sm uppercase tracking-wider mb-1 group-hover:text-green-500 transition-colors">Cash On Delivery</h4>
                <p className="text-[11px] text-gray-500 font-medium">Pay upon receiving</p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center group">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-[#333] to-[#1a1a1a] border border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)] group-hover:border-[#7D2596]/50 group-hover:shadow-[#7D2596]/20">
                    <Headset size={28} className="text-[#7D2596] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-100 text-sm uppercase tracking-wider mb-1 group-hover:text-[#7D2596] transition-colors">Support 24/7</h4>
                <p className="text-[11px] text-gray-500 font-medium">Contact us anytime</p>
            </div>

            </div>
        </div>
      </div>

      {/* --- MAIN FOOTER CONTENT --- */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* COLUMN 1: Brand & Contact Info */}
          <div className="space-y-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
                <img src="/vite.svg" alt="Logo" className="w-10 h-10 object-contain" />
                <div className="flex flex-col">
                    <span className="text-2xl font-extrabold text-white tracking-wide leading-none">
                        IGNITE
                    </span>
                    <span className="text-xs font-bold text-[#7D2596] tracking-[0.2em] uppercase">
                        Ideas Into Reality
                    </span>
                </div>
            </Link>

            <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 text-sm text-gray-400">
                    <MapPin size={20} className="text-[#7D2596] flex-shrink-0 mt-0.5" />
                    <span>VIT College Campus,<br/>Bibwewadi / Kondhwa, Pune.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Mail size={20} className="text-[#7D2596] flex-shrink-0" />
                    <a href="mailto:connectwithignite@gmail.com" className="hover:text-[#7D2596] transition-colors">connectwithignite@gmail.com</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Phone size={20} className="text-[#7D2596] flex-shrink-0" />
                    <a href="tel:+919011401920" className="hover:text-[#7D2596] transition-colors font-bold">+91 90114 01920</a>
                </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 pt-2">
                {/* Instagram */}
                <a 
                    href="https://www.instagram.com/ignite.tech?utm_source=qr&igsh=azhoaWJ6cGw3b2pj" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-[#252525] text-gray-300 rounded-full flex items-center justify-center hover:bg-[#7D2596] hover:text-white transition-all shadow-sm border border-gray-700 hover:border-[#7D2596]"
                >
                  <Instagram size={18} />
                </a>
                
                {/* Twitter */}
                <a 
                    href="#" 
                    className="w-10 h-10 bg-[#252525] text-gray-300 rounded-full flex items-center justify-center hover:bg-[#7D2596] hover:text-white transition-all shadow-sm border border-gray-700 hover:border-[#7D2596]"
                >
                  <Twitter size={18} />
                </a>
            </div>
          </div>

          {/* COLUMN 2: Categories (Dynamic) */}
          <div className="lg:pl-6">
            <h3 className="text-lg font-bold text-white mb-6 border-b-2 border-[#7D2596] inline-block pb-1">Categories</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/shop?category=${cat.id}`} className="hover:text-[#7D2596] hover:translate-x-1 transition-all flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div> {cat.name}
                  </Link>
                </li>
              ))}
              
              <li>
                <Link to="/shop" className="hover:text-[#7D2596] hover:translate-x-1 transition-all flex items-center gap-2 font-semibold">
                  <div className="w-1.5 h-1.5 bg-[#7D2596] rounded-full"></div> View All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Company & Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 border-b-2 border-[#7D2596] inline-block pb-1">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-[#7D2596] hover:translate-x-1 transition-all inline-block">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#7D2596] hover:translate-x-1 transition-all inline-block">Contact Us</Link></li>
              <li>
                <Link to="/contact" className="hover:text-[#7D2596] hover:translate-x-1 transition-all flex items-center gap-2 font-medium text-gray-300">
                   <Package size={14} /> Bulk Order Enquiry
                </Link>
              </li>
              <li><Link to="/orders" className="hover:text-[#7D2596] hover:translate-x-1 transition-all inline-block">Track Orders</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: Policies & Support */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6 border-b-2 border-[#7D2596] inline-block pb-1">Policies & Support</h3>
            <ul className="space-y-3 text-sm text-gray-400 mb-6">
              <li><Link to="/privacy" className="hover:text-[#7D2596] transition-all flex items-center gap-2"><FileText size={14}/> Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#7D2596] transition-all flex items-center gap-2"><FileText size={14}/> Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-[#7D2596] transition-all flex items-center gap-2"><FileText size={14}/> Return Policy</Link></li>
            </ul>

            {/* WhatsApp Button */}
            <div className="bg-[#222] p-4 rounded-xl border border-gray-700">
                <p className="text-xs text-gray-300 font-bold mb-2">NEED INSTANT HELP?</p>
                <a 
                    href="https://wa.me/919011401920" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-lg font-bold text-sm shadow-md hover:bg-[#20bd5a] transition-all hover:-translate-y-1 w-full"
                >
                    <MessageCircle size={20} /> WhatsApp Us
                </a>
            </div>
          </div>

        </div>
      </div>

      {/* --- COPYRIGHT BAR --- */}
      <div className="border-t border-gray-800 bg-black">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-xs text-gray-500 font-medium">
              © {new Date().getFullYear()} Ignite Ideas. All Rights Reserved. Designed for Ignite Store.
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;