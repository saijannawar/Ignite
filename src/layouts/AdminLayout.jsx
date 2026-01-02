import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Image as ImageIcon, Grid, Package, Users, ShoppingBag, 
  Flag, LogOut, ChevronRight, Menu, Bell
} from 'lucide-react';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext'; // Assuming you have this context available

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState(null); 
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth(); // Get current user for avatar

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const toggleSubMenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  // Menu Configuration
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    { 
      name: 'Home Slides', 
      icon: <ImageIcon size={20} />, 
      subItems: [
        { name: 'Home Banners List', path: '/admin/home-slides' }, 
        { name: 'Add Home Banner Slide', path: '/admin/home-slides/add' }
      ] 
    },
    { 
      name: 'Category', 
      icon: <Grid size={20} />, 
      subItems: [
        { name: 'Category List', path: '/admin/category' }, 
        { name: 'Add A Category', path: '/admin/category/add' },
        { name: 'Sub Category List', path: '/admin/subcategory' },
        { name: 'Add A Sub Category', path: '/admin/subcategory/add' }
      ] 
    },
    { 
      name: 'Products', 
      icon: <Package size={20} />, 
      subItems: [
        { name: 'Product List', path: '/admin/products' }, 
        { name: 'Product Upload', path: '/admin/products/add' },
      ] 
    },
    { name: 'Users', icon: <Users size={20} />, path: '/admin/users' },
    { name: 'Orders', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
    
    // BANNERS SECTION
    { 
      name: 'Banners', 
      icon: <Flag size={20} />, 
      subItems: [
        { name: 'Home Banner List', path: '/admin/banners/home-1' }, 
        { name: 'Add Home Banner', path: '/admin/banners/home-1/add' },
        { name: 'Home Banner List 2', path: '/admin/banners/home-2' },
        { name: 'Add Banner', path: '/admin/banners/home-2/add' }
      ] 
    },
    
    // ❌ REMOVED: Manage Logo
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} overflow-y-auto z-20`}>
        {/* Logo Area */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-gray-100">
           {/* Logo Image */}
           <img src="/vite.svg" alt="Ignite Logo" className="w-8 h-8 object-contain flex-shrink-0" />
           
           {/* Logo Text (Only show if sidebar open) */}
           {sidebarOpen && (
            <div className="flex flex-col overflow-hidden">
                <span className="text-xl font-extrabold text-gray-800 tracking-wide leading-none truncate">
                IGNITE
                </span>
                <span className="text-[10px] font-bold text-[#7D2596] tracking-[0.2em] uppercase truncate">
                ADMIN PANEL
                </span>
            </div>
           )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || (item.subItems && item.subItems.some(sub => location.pathname === sub.path));
            const isExpanded = expandedMenu === item.name;

            return (
              <div key={index} className="overflow-hidden">
                {/* Parent Item */}
                <div 
                  onClick={() => item.subItems ? toggleSubMenu(item.name) : navigate(item.path)}
                  className={`flex items-center justify-between px-3 py-3 rounded-md cursor-pointer transition-colors relative z-10 ${
                    isActive ? 'text-[#7D2596] bg-purple-50' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                  </div>
                  {sidebarOpen && item.subItems && (
                    <ChevronRight size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                  )}
                </div>

                {/* Submenu Items (Smooth Animation) */}
                {sidebarOpen && item.subItems && (
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 pl-2 py-1">
                      {item.subItems.map((sub, subIndex) => (
                        <Link 
                          key={subIndex} 
                          to={sub.path}
                          className={`block px-3 py-2 text-xs rounded-md transition-colors ${
                            location.pathname === sub.path 
                            ? 'text-[#7D2596] font-bold bg-purple-50/50' 
                            : 'text-gray-500 hover:text-[#7D2596] hover:bg-purple-50'
                          }`}
                        >
                          • {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 mt-6 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </nav>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-700">
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell size={22} className="text-gray-500 hover:text-[#7D2596] transition-colors" />
              <span className="absolute -top-1 -right-1 bg-[#7D2596] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">4</span>
            </div>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-[#7D2596] font-bold text-sm border border-purple-200">
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa]">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}