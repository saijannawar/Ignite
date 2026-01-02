import React from 'react';
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
  Facebook, 
  Instagram, 
  Twitter,
  Package,
  FileText
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 font-sans pb-24 md:pb-0 text-gray-700">
      
      {/* --- TOP FEATURES BAR --- */}
      <div className="bg-[#fdfaff] border-b border-gray-100">
        <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-center group">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:bg-[#7D2596] transition-colors border border-gray-100">
                    <Truck size={28} className="text-[#7D2596] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm uppercase mb-1">Free Shipping</h4>
                <p className="text-xs text-gray-500">On VIT College Pickup</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center group">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:bg-red-500 transition-colors border border-gray-100">
                    <Ban size={28} className="text-[#7D2596] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm uppercase mb-1">No Returns</h4>
                <p className="text-xs text-gray-500">All Sales Are Final</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center group">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:bg-green-600 transition-colors border border-gray-100">
                    <Banknote size={28} className="text-[#7D2596] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm uppercase mb-1">Cash On Delivery</h4>
                <p className="text-xs text-gray-500">Pay upon receiving</p>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col items-center group">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:bg-[#7D2596] transition-colors border border-gray-100">
                    <Headset size={28} className="text-[#7D2596] group-hover:text-white transition-colors" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm uppercase mb-1">Support 24/7</h4>
                <p className="text-xs text-gray-500">Contact us anytime</p>
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
                    <span className="text-2xl font-extrabold text-gray-900 tracking-wide leading-none">
                        IGNITE
                    </span>
                    <span className="text-xs font-bold text-[#7D2596] tracking-[0.2em] uppercase">
                        Ideas Into Reality
                    </span>
                </div>
            </Link>

            <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                    <MapPin size={20} className="text-[#7D2596] flex-shrink-0 mt-0.5" />
                    <span>VIT College Campus,<br/>Bibwewadi / Kondhwa, Pune.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Mail size={20} className="text-[#7D2596] flex-shrink-0" />
                    <a href="mailto:connectwithignite@gmail.com" className="hover:text-[#7D2596] transition-colors">connectwithignite@gmail.com</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Phone size={20} className="text-[#7D2596] flex-shrink-0" />
                    <a href="tel:+919011401920" className="hover:text-[#7D2596] transition-colors font-bold">+91 90114 01920</a>
                </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-4 pt-2">
                <a href="#" className="w-9 h-9 bg-white text-gray-500 rounded-full flex items-center justify-center hover:bg-[#7D2596] hover:text-white transition-all shadow-sm border border-gray-200">
                  <Facebook size={16} />
                </a>
                <a href="#" className="w-9 h-9 bg-white text-gray-500 rounded-full flex items-center justify-center hover:bg-[#7D2596] hover:text-white transition-all shadow-sm border border-gray-200">
                  <Instagram size={16} />
                </a>
                <a href="#" className="w-9 h-9 bg-white text-gray-500 rounded-full flex items-center justify-center hover:bg-[#7D2596] hover:text-white transition-all shadow-sm border border-gray-200">
                  <Twitter size={16} />
                </a>
            </div>
          </div>

          {/* COLUMN 2: Categories */}
          <div className="lg:pl-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b-2 border-[#7D2596] inline-block pb-1">Categories</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/shop?category=Sensors" className="hover:text-[#7D2596] hover:translate-x-1 transition-all flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> Sensors</Link></li>
              <li><Link to="/shop?category=Arduino" className="hover:text-[#7D2596] hover:translate-x-1 transition-all flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> Arduino Boards</Link></li>
              <li><Link to="/shop?category=Modules" className="hover:text-[#7D2596] hover:translate-x-1 transition-all flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> Modules</Link></li>
              <li><Link to="/shop?category=Robotics" className="hover:text-[#7D2596] hover:translate-x-1 transition-all flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> Robotics</Link></li>
              <li><Link to="/shop" className="hover:text-[#7D2596] hover:translate-x-1 transition-all flex items-center gap-2"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div> View All Products</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: Company & Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b-2 border-[#7D2596] inline-block pb-1">Company</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/about" className="hover:text-[#7D2596] hover:translate-x-1 transition-all inline-block">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#7D2596] hover:translate-x-1 transition-all inline-block">Contact Us</Link></li>
              
              {/* Bulk Order Enquiry */}
              <li>
                <Link to="/contact" className="hover:text-[#7D2596] hover:translate-x-1 transition-all flex items-center gap-2 font-medium text-gray-700">
                   <Package size={14} /> Bulk Order Enquiry
                </Link>
              </li>
              
              <li><Link to="/orders" className="hover:text-[#7D2596] hover:translate-x-1 transition-all inline-block">Track Orders</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: Policies & Support */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 border-b-2 border-[#7D2596] inline-block pb-1">Policies & Support</h3>
            
            <ul className="space-y-3 text-sm text-gray-500 mb-6">
              <li><Link to="/privacy" className="hover:text-[#7D2596] transition-all flex items-center gap-2"><FileText size={14}/> Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#7D2596] transition-all flex items-center gap-2"><FileText size={14}/> Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="hover:text-[#7D2596] transition-all flex items-center gap-2"><FileText size={14}/> Return Policy</Link></li>
            </ul>

            {/* WhatsApp Button */}
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs text-green-800 font-bold mb-2">NEED INSTANT HELP?</p>
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
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-xs text-gray-500 font-medium">
             © {new Date().getFullYear()} Ignite Ideas. All Rights Reserved. Designed for VIT Pune.
          </p>
        </div>
      </div>

    </footer>
  );
};

export default Footer;