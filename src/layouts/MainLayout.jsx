import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/client/Navbar';
import BottomNav from '../components/client/BottomNav';
import CategorySidebar from '../components/client/CategorySidebar';

const MainLayout = () => {
  // State to manage the Sidebar visibility (Slide-out menu)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Navbar (Top) */}
      {/* Pass 'onOpenSidebar' so the hamburger menu in Navbar works */}
      <Navbar onOpenSidebar={() => setIsSidebarOpen(true)} />

      {/* 2. Category Sidebar (Drawer) */}
      {/* It sits on top of everything when open */}
      <CategorySidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 3. Main Page Content */}
      {/* 'flex-grow' pushes the footer down if you had one.
          'pb-20' adds padding at bottom so Mobile BottomNav doesn't cover content.
          'md:pb-0' removes that padding on Desktop. */}
      <main className="flex-grow bg-gray-50 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* 4. Bottom Navigation (Mobile Only) */}
      {/* Pass 'onOpenCategory' so the 'Category' button in BottomNav works */}
      <BottomNav onOpenCategory={() => setIsSidebarOpen(true)} />
      
    </div>
  );
};

export default MainLayout;