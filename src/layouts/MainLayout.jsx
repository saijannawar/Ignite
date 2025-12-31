import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';

// Import Components
import Navbar from '../components/client/Navbar';
import Sidebar from '../components/client/CategorySidebar';
import Footer from '../components/common/Footer';
import BottomNav from '../components/common/BottomNav'; // ✅ Import BottomNav

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#f8f9fa]">
      
      {/* 1. Navbar (Top) */}
      <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

      {/* 2. Sidebar (Drawer) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 3. Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 4. Footer (Bottom) */}
      {/* Added mb-16 on mobile to prevent Footer getting hidden behind BottomNav */}
      <div className="mb-16 md:mb-0">
        <Footer />
      </div>

      {/* 5. Mobile Bottom Navigation (Visible only on mobile) */}
      <BottomNav />
      
    </div>
  );
};

export default MainLayout;