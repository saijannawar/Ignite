import React from 'react';
import { Outlet } from 'react-router-dom';
import BlogNavbar from '../components/blog/BlogNavbar';
import BlogFooter from '../components/blog/BlogFooter';
import ScrollToTop from '../components/common/ScrollToTop';

const BlogLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#f3f4f6]">
      <ScrollToTop />
      
      {/* 1. Blog Specific Navbar */}
      <BlogNavbar />

      {/* 2. Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 3. Blog Specific Footer */}
      <BlogFooter />
    </div>
  );
};

export default BlogLayout;