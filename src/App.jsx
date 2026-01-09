import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; 

// ✅ Import Preloader & ScrollToTop
import Preloader from './components/common/Preloader';
import ScrollToTop from './components/common/ScrollToTop'; 

// --- LAZY LOAD PAGES ---
// Auth
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Client Pages
const Home = lazy(() => import('./pages/client/Home'));
const Shop = lazy(() => import('./pages/client/Shop'));
const About = lazy(() => import('./pages/client/About'));
const Cart = lazy(() => import('./pages/client/Cart'));       
const Checkout = lazy(() => import('./pages/client/Checkout'));
const OrderSuccess = lazy(() => import('./pages/client/OrderSuccess')); 

const ClientProductDetails = lazy(() => import('./pages/client/ClientProductDetails')); 
const MyAccount = lazy(() => import('./pages/client/MyAccount')); 

// ✅ Blog Pages (Client) - UPDATED
const BlogHome = lazy(() => import('./pages/client/blog/BlogHome'));
const BlogDetails = lazy(() => import('./pages/client/blog/BlogDetails'));
const BlogList = lazy(() => import('./pages/client/blog/BlogList')); // General List/Search
const BlogCategory = lazy(() => import('./pages/client/blog/BlogCategory')); // ✅ NEW

const BlogTrending = lazy(() => import('./pages/client/blog/BlogTrending')); // ✅ NEW
const BlogForYou = lazy(() => import('./pages/client/blog/BlogForYou'));     // ✅ NEW
const BlogSearch = lazy(() => import('./pages/client/blog/BlogSearch'));     // ✅ NEW


// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const HomeBannersList = lazy(() => import('./pages/admin/HomeBannersList'));
const AddHomeSlide = lazy(() => import('./pages/admin/AddHomeSlide'));
const ProductList = lazy(() => import('./pages/admin/product/ProductList'));
const AddProduct = lazy(() => import('./pages/admin/product/AddProduct'));
const EditProduct = lazy(() => import('./pages/admin/product/EditProduct')); 
const AdminProductDetails = lazy(() => import('./pages/admin/product/ProductDetails')); 
const CategoryList = lazy(() => import('./pages/admin/category/CategoryList'));
const AddCategory = lazy(() => import('./pages/admin/category/AddCategory'));
const SubCategoryList = lazy(() => import('./pages/admin/category/SubCategoryList'));
const AddSubCategory = lazy(() => import('./pages/admin/category/AddSubCategory'));
const EditSubCategory = lazy(() => import('./pages/admin/category/EditSubCategory')); 
const EditCategory = lazy(() => import('./pages/admin/category/EditCategory'));
const BannerList1 = lazy(() => import('./pages/admin/banners/BannerList1'));
const AddBanner1 = lazy(() => import('./pages/admin/banners/AddBanner1'));
const BannerList2 = lazy(() => import('./pages/admin/banners/BannerList2'));
const AddBanner2 = lazy(() => import('./pages/admin/banners/AddBanner2'));
const UserList = lazy(() => import('./pages/admin/user/UserList'));
const AdminOrders = lazy(() => import('./pages/admin/orders/AdminOrders'));
const ManageLogo = lazy(() => import('./pages/admin/ManageLogo')); 

// ✅ Blog Pages (Admin)
const AdminBlogList = lazy(() => import('./pages/admin/blog/AdminBlogList'));
const AddEditBlog = lazy(() => import('./pages/admin/blog/AddEditBlog'));
const BlogCategoryList = lazy(() => import('./pages/admin/blog/BlogCategoryList'));
const AddBlogCategory = lazy(() => import('./pages/admin/blog/AddBlogCategory'));


// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import BlogLayout from './layouts/BlogLayout'; 

// --- Protection Component ---
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) return <Preloader />; 
  
  if (!currentUser) return <Navigate to="/login" />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" />;
  return children;
};

// --- App Content Wrapper ---
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) return <Preloader />;

  return (
    <Suspense fallback={<Preloader />}>
      <Routes>
        
        {/* --- A. Main Layout Routes --- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ClientProductDetails />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/about" element={<About />} />
          <Route path="/search" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          <Route path="/address" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          
          <Route path="/privacy" element={<Home />} />
          <Route path="/terms" element={<Home />} />
          <Route path="/contact" element={<About />} />
        </Route>

        {/* --- B. Blog Layout Routes (Dedicated Design) --- */}
        <Route element={<BlogLayout />}>
            <Route path="/blogs" element={<BlogHome />} />
            <Route path="/blogs/:id" element={<BlogDetails />} />
            
            {/* ✅ NEW DEDICATED ROUTES */}
            <Route path="/blogs/search" element={<BlogSearch />} />
            <Route path="/blogs/category/:category" element={<BlogCategory />} />
            <Route path="/blogs/trending" element={<BlogTrending />} />
            <Route path="/blogs/saved" element={<BlogForYou />} />
            
            {/* Fallback for general list if needed */}
            <Route path="/blogs/list" element={<BlogList />} /> 
        </Route>

        {/* --- C. Admin Area --- */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductList />} /> 
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="products/view/:id" element={<AdminProductDetails />} />
          <Route path="home-slides" element={<HomeBannersList />} />
          <Route path="home-slides/add" element={<AddHomeSlide />} />
          <Route path="category" element={<CategoryList />} />
          <Route path="category/add" element={<AddCategory />} />
          <Route path="subcategory" element={<SubCategoryList />} />
          <Route path="subcategory/add" element={<AddSubCategory />} />
          <Route path="subcategory/edit/:id" element={<EditSubCategory />} />
          <Route path="category/edit/:id" element={<EditCategory />} />
          <Route path="banners/home-1" element={<BannerList1 />} />
          <Route path="banners/home-1/add" element={<AddBanner1 />} />
          <Route path="banners/home-2" element={<BannerList2 />} />
          <Route path="banners/home-2/add" element={<AddBanner2 />} />
          <Route path="logo" element={<ManageLogo />} />
          <Route path="users" element={<UserList />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="blogs" element={<AdminBlogList />} />
          <Route path="blogs/add" element={<AddEditBlog />} />
          <Route path="blogs/edit/:id" element={<AddEditBlog />} />
          <Route path="blog-categories" element={<BlogCategoryList />} />
          <Route path="blog-categories/add" element={<AddBlogCategory />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
           <ScrollToTop /> 
           <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;