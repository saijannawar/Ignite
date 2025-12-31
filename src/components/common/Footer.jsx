import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, RefreshCcw, ShieldCheck, Gift, Headset, 
  MessageSquare, Facebook, Youtube, Instagram, Twitter 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 font-sans pb-20 md:pb-0">
      
      {/* --- TOP FEATURES BAR (Hidden on small mobile to save space, or stack) --- */}
      <div className="container mx-auto px-4 py-8 border-b border-gray-100 hidden md:block">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          <div className="flex flex-col items-center group">
            <Truck size={32} className="text-gray-800 mb-2 group-hover:text-[#7D2596] transition-colors" strokeWidth={1.5} />
            <h4 className="font-bold text-gray-800 text-xs uppercase">Free Shipping</h4>
            <p className="text-[10px] text-gray-500">Orders over ₹200</p>
          </div>
          <div className="flex flex-col items-center group">
            <RefreshCcw size={32} className="text-gray-800 mb-2 group-hover:text-[#7D2596] transition-colors" strokeWidth={1.5} />
            <h4 className="font-bold text-gray-800 text-xs uppercase">30 Days Returns</h4>
            <p className="text-[10px] text-gray-500">For exchange</p>
          </div>
          <div className="flex flex-col items-center group">
            <ShieldCheck size={32} className="text-gray-800 mb-2 group-hover:text-[#7D2596] transition-colors" strokeWidth={1.5} />
            <h4 className="font-bold text-gray-800 text-xs uppercase">Secured Payment</h4>
            <p className="text-[10px] text-gray-500">Cards Accepted</p>
          </div>
          <div className="flex flex-col items-center group">
            <Gift size={32} className="text-gray-800 mb-2 group-hover:text-[#7D2596] transition-colors" strokeWidth={1.5} />
            <h4 className="font-bold text-gray-800 text-xs uppercase">Special Gifts</h4>
            <p className="text-[10px] text-gray-500">First Order</p>
          </div>
          <div className="flex flex-col items-center group">
            <Headset size={32} className="text-gray-800 mb-2 group-hover:text-[#7D2596] transition-colors" strokeWidth={1.5} />
            <h4 className="font-bold text-gray-800 text-xs uppercase">Support 24/7</h4>
            <p className="text-[10px] text-gray-500">Contact anytime</p>
          </div>
        </div>
      </div>

      {/* --- MIDDLE SECTION --- */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* 1. Contact Us */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contact us</h3>
            <div className="text-sm text-gray-500 space-y-3">
              <p>Classyshop - Mega Super Store<br/>507-Union Trade Centre France</p>
              <p>sales@yourcompany.com</p>
              <p className="text-xl font-bold text-[#7D2596]">(+91) 9876-543-210</p>
              
              <a 
                href="https://wa.me/919011401920" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start gap-2 mt-3 group"
              >
                <MessageSquare size={24} className="text-[#ff4d4d] group-hover:text-[#7D2596] transition-colors" />
                <div className="text-left leading-tight">
                  <span className="block font-bold text-gray-800 group-hover:text-[#7D2596] transition-colors text-sm">Online Chat</span>
                  <span className="text-[10px]">Get Expert Help</span>
                </div>
              </a>
            </div>
          </div>

          {/* 2. Products */}
          <div className="hidden md:block">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/shop" className="hover:text-[#7D2596] transition-colors">Prices drop</Link></li>
              <li><Link to="/shop" className="hover:text-[#7D2596] transition-colors">New products</Link></li>
              <li><Link to="/shop" className="hover:text-[#7D2596] transition-colors">Best sales</Link></li>
              <li><Link to="/contact" className="hover:text-[#7D2596] transition-colors">Contact us</Link></li>
            </ul>
          </div>

          {/* 3. Our Company (Hidden on mobile to reduce scroll) */}
          <div className="hidden md:block">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Our company</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/delivery" className="hover:text-[#7D2596] transition-colors">Delivery</Link></li>
              <li><Link to="/legal" className="hover:text-[#7D2596] transition-colors">Legal Notice</Link></li>
              <li><Link to="/about" className="hover:text-[#7D2596] transition-colors">About us</Link></li>
              <li><Link to="/secure-payment" className="hover:text-[#7D2596] transition-colors">Secure payment</Link></li>
            </ul>
          </div>

          {/* 4. Newsletter */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Subscribe to newsletter</h3>
            <p className="text-sm text-gray-500 mb-4">Get the latest updates on new products and upcoming sales.</p>
            
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Your Email Address" 
                className="w-full bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#7D2596] focus:ring-1 focus:ring-purple-100 transition-all rounded"
              />
              <button className="bg-[#7D2596] text-white font-bold text-sm uppercase py-3 px-6 rounded hover:bg-[#631d76] transition-colors w-full md:w-auto">
                Subscribe
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* --- BOTTOM BAR --- */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 py-6 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          
          {/* Copyright */}
          <p className="text-xs text-gray-500 text-center md:text-left">© 2024 - Ecommerce Template</p>

          {/* Social Icons */}
          <div className="flex gap-3">
            <a href="#" className="w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center hover:bg-[#7D2596] hover:text-white transition-all shadow-sm border border-gray-200">
              <Facebook size={14} />
            </a>
            <a href="#" className="w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center hover:bg-[#7D2596] hover:text-white transition-all shadow-sm border border-gray-200">
              <Instagram size={14} />
            </a>
            <a href="#" className="w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center hover:bg-[#7D2596] hover:text-white transition-all shadow-sm border border-gray-200">
              <Twitter size={14} />
            </a>
          </div>

          {/* Payment Icons */}
          <div className="flex gap-2 opacity-80 grayscale hover:grayscale-0 transition-all">
             <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-5" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5" />
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;