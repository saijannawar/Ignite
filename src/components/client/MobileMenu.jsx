import { Link } from 'react-router-dom';
import { X, Plus, ShoppingCart } from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../config/firebase'; // 1. IMPORT AUTH HERE

export default function MobileMenu({ isOpen, onClose }) {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await auth.signOut(); // 2. EXECUTE LOGOUT
      onClose(); // Close the menu after logging out
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const categories = [
    "Fashion", "Electronics", "Bags", "Footwear", 
    "Groceries", "Beauty", "Wellness", "Jewellery"
  ];

  return (
    <>
      {/* 1. Dark Overlay (Backdrop) - z-[998] */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-[998] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={onClose}
      />

      {/* 2. The Sidebar Panel - z-[999] */}
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-[999] shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* --- Header Section --- */}
        <div className="flex-none p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-red-500 text-white p-1.5 rounded">
               <ShoppingCart className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
               <span className="text-xl font-bold tracking-tight text-gray-800 leading-none">CLASSYSHOP</span>
               <span className="text-[10px] text-gray-500 font-semibold tracking-widest">BIG MEGA STORE</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-700">Shop By Categories</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* --- Categories List --- */}
        <div className="flex-1 overflow-y-auto">
          <ul>
            {categories.map((cat, index) => (
              <li key={index} className="border-b border-gray-50">
                <button className="w-full flex items-center justify-between p-4 text-gray-600 hover:bg-gray-50 text-left group transition-colors">
                  <span className="font-medium text-[15px]">{cat}</span>
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* --- Footer (Logout/Login) --- */}
        <div className="flex-none p-4 border-t border-gray-100 bg-white">
          {currentUser ? (
             <button 
               onClick={handleLogout}
               className="w-full bg-gray-800 text-white py-3 rounded font-bold text-center tracking-wide hover:bg-gray-900 transition-colors"
             >
               LOGOUT
             </button>
          ) : (
            <Link 
              to="/login" 
              onClick={onClose}
              className="block w-full bg-[#ff4d4d] text-white py-3 rounded font-bold text-center shadow-md hover:bg-red-600 transition tracking-wide"
            >
              Login
            </Link>
          )}
        </div>

      </div>
    </>
  );
}