import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Truck, RefreshCcw, ShieldCheck, Gift, Headset, 
  MessageSquare, Facebook, Youtube, Instagram, Twitter 
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 font-sans">
      
      {/* --- TOP FEATURES BAR --- */}
      <div className="container mx-auto px-4 py-10 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
          
          <div className="flex flex-col items-center group">
            <Truck size={40} className="text-gray-800 mb-3 group-hover:text-[#734F96] transition-colors" strokeWidth={1.5} />
            <h4 className="font-bold text-gray-800 text-sm uppercase mb-1">Free Shipping</h4>
            <p className="text-xs text-gray-500">For all Orders Over ₹200</p>
          </div>

          <div className="flex flex-col items-center group">
            <RefreshCcw size={40} className="text-gray-800 mb-3 group-hover:text-[#734F96] transition-colors" strokeWidth={1.5} />
            <h4 className="font-bold text-gray-800 text-sm uppercase mb-1">30 Days Returns</h4>
            <p className="text-xs text-gray-500">For an Exchange Product</p>
          </div>

          <div className="flex flex-col items-center group">
            <ShieldCheck size={40} className="text-gray-800 mb-3 group-hover:text-[#734F96] transition-colors" strokeWidth={1.5} />
            <h4 className="font-bold text-gray-800 text-sm uppercase mb-1">Secured Payment</h4>
            <p className="text-xs text-gray-500">Payment Cards Accepted</p>
          </div>

          <div className="flex flex-col items-center group">
            <Gift size={40} className="text-gray-800 mb-3 group-hover:text-[#734F96] transition-colors" strokeWidth={1.5} />
            <h4 className="font-bold text-gray-800 text-sm uppercase mb-1">Special Gifts</h4>
            <p className="text-xs text-gray-500">Our First Product Order</p>
          </div>

          <div className="flex flex-col items-center group">
            <Headset size={40} className="text-gray-800 mb-3 group-hover:text-[#734F96] transition-colors" strokeWidth={1.5} />
            <h4 className="font-bold text-gray-800 text-sm uppercase mb-1">Support 24/7</h4>
            <p className="text-xs text-gray-500">Contact us Anytime</p>
          </div>

        </div>
      </div>

      {/* --- MIDDLE SECTION --- */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* 1. Contact Us */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Contact us</h3>
            <div className="text-sm text-gray-500 space-y-4">
              <p>Classyshop - Mega Super Store<br/>507-Union Trade Centre France</p>
              <p>sales@yourcompany.com</p>
              <p className="text-2xl font-bold text-[#734F96]">(+91) 9876-543-210</p>
              
              <a 
                href="https://wa.me/919011401920" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 mt-4 group"
              >
                <MessageSquare size={32} className="text-[#ff4d4d] group-hover:text-[#734F96] transition-colors" />
                <div className="text-left">
                  <span className="block font-bold text-gray-800 group-hover:text-[#734F96] transition-colors">Online Chat</span>
                  <span className="text-xs">Get Expert Help</span>
                </div>
              </a>
            </div>
          </div>

          {/* 2. Products */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Products</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/shop" className="hover:text-[#734F96] transition-colors">Prices drop</Link></li>
              <li><Link to="/shop" className="hover:text-[#734F96] transition-colors">New products</Link></li>
              <li><Link to="/shop" className="hover:text-[#734F96] transition-colors">Best sales</Link></li>
              <li><Link to="/contact" className="hover:text-[#734F96] transition-colors">Contact us</Link></li>
              <li><Link to="/sitemap" className="hover:text-[#734F96] transition-colors">Sitemap</Link></li>
            </ul>
          </div>

          {/* 3. Our Company */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Our company</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link to="/delivery" className="hover:text-[#734F96] transition-colors">Delivery</Link></li>
              <li><Link to="/legal" className="hover:text-[#734F96] transition-colors">Legal Notice</Link></li>
              <li><Link to="/terms" className="hover:text-[#734F96] transition-colors">Terms and conditions</Link></li>
              <li><Link to="/about" className="hover:text-[#734F96] transition-colors">About us</Link></li>
              <li><Link to="/secure-payment" className="hover:text-[#734F96] transition-colors">Secure payment</Link></li>
            </ul>
          </div>

          {/* 4. Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-6">Subscribe to newsletter</h3>
            <p className="text-sm text-gray-500 mb-4">Subscribe to our latest newsletter to get news about special discounts.</p>
            
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="Your Email Address" 
                className="w-full bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#734F96] focus:ring-1 focus:ring-purple-100 transition-all rounded"
              />
              <button className="bg-[#ff4d4d] text-white font-bold text-sm uppercase py-3 px-6 rounded hover:bg-red-600 transition-colors w-max">
                Subscribe
              </button>
            </form>
            
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="privacy" className="accent-[#734F96] cursor-pointer" />
              <label htmlFor="privacy" className="text-xs text-gray-500 cursor-pointer select-none">
                I agree to the terms and conditions and the privacy policy
              </label>
            </div>
          </div>

        </div>
      </div>

      {/* --- BOTTOM BAR --- */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Social Icons */}
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center hover:bg-[#734F96] hover:text-white transition-all shadow-sm border border-gray-200">
              <Facebook size={16} />
            </a>
            <a href="#" className="w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center hover:bg-[#734F96] hover:text-white transition-all shadow-sm border border-gray-200">
              <Youtube size={16} />
            </a>
            <a href="#" className="w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center hover:bg-[#734F96] hover:text-white transition-all shadow-sm border border-gray-200">
              <Instagram size={16} />
            </a>
            <a href="#" className="w-8 h-8 bg-white text-gray-600 rounded-full flex items-center justify-center hover:bg-[#734F96] hover:text-white transition-all shadow-sm border border-gray-200">
              <Twitter size={16} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-500">© 2024 - Ecommerce Template</p>

          {/* Payment Icons */}
          <div className="flex gap-2 opacity-80 grayscale hover:grayscale-0 transition-all">
             <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6" />
          </div>

        </div>
      </div>

    </footer>
  );
};

export default Footer;