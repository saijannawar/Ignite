import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext'; 

// ✅ Import Preloader & ScrollToTop
import Preloader from './components/common/Preloader';
import ScrollToTop from './components/common/ScrollToTop'; // <--- NEW IMPORT

// --- LAZY LOAD PAGES (For Better Performance) ---
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
const BannerList1 = lazy(() => import('./pages/admin/banners/BannerList1'));
const AddBanner1 = lazy(() => import('./pages/admin/banners/AddBanner1'));
const BannerList2 = lazy(() => import('./pages/admin/banners/BannerList2'));
const AddBanner2 = lazy(() => import('./pages/admin/banners/AddBanner2'));
const UserList = lazy(() => import('./pages/admin/user/UserList'));
const AdminOrders = lazy(() => import('./pages/admin/orders/AdminOrders'));
const ManageLogo = lazy(() => import('./pages/admin/ManageLogo')); 

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// --- Protection Component ---
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  if (loading) return <Preloader />; 
  
  if (!currentUser) return <Navigate to="/login" />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" />;
  return children;
};

// --- App Content Wrapper (Handles Auth Loading) ---
const AppContent = () => {
  const { loading } = useAuth();

  // Show Preloader while Firebase connects
  if (loading) {
    return <Preloader />;
  }

  return (
    <Suspense fallback={<Preloader />}>
      <Routes>
        
        {/* --- Main Layout Routes (Client Store) --- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Client View: Product Details */}
          <Route path="/product/:id" element={<ClientProductDetails />} />

          {/* Shop Route */}
          <Route path="/shop" element={<Shop />} />

          {/* About Route */}
          <Route path="/about" element={<About />} />
          
          {/* Search Route */}
          <Route path="/search" element={<Shop />} />
          
          {/* Cart & Checkout Routes */}
          <Route path="/cart" element={<Cart />} />
          
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />

          {/* Order Success Route */}
          <Route path="/order-success" element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          } />

          {/* --- Account Related Routes --- */}
          <Route path="/account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          <Route path="/address" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          
          {/* Orders route for tracking */}
          <Route path="/orders" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
          
          {/* Policy Routes (Optional - map to Home or create new pages) */}
          <Route path="/privacy" element={<Home />} />
          <Route path="/terms" element={<Home />} />
          <Route path="/contact" element={<About />} />
          
        </Route>

        {/* --- Admin Area --- */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Product Management */}
          <Route path="products" element={<ProductList />} /> 
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="products/view/:id" element={<AdminProductDetails />} />

          {/* Home Slides Management */}
          <Route path="home-slides" element={<HomeBannersList />} />
          <Route path="home-slides/add" element={<AddHomeSlide />} />

          {/* Category Management */}
          <Route path="category" element={<CategoryList />} />
          <Route path="category/add" element={<AddCategory />} />

          {/* Sub Category Management */}
          <Route path="subcategory" element={<SubCategoryList />} />
          <Route path="subcategory/add" element={<AddSubCategory />} />

          {/* Banner Management Routes */}
          <Route path="banners/home-1" element={<BannerList1 />} />
          <Route path="banners/home-1/add" element={<AddBanner1 />} />
          
          <Route path="banners/home-2" element={<BannerList2 />} />
          <Route path="banners/home-2/add" element={<AddBanner2 />} />

          {/* Logo Management Route */}
          <Route path="logo" element={<ManageLogo />} />

          {/* User Management */}
          <Route path="users" element={<UserList />} />

          {/* Admin Orders */}
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        {/* Catch-all */}
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
           {/* ✅ ScrollToTop must be inside Router but outside Routes */}
           <ScrollToTop /> 
           <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;