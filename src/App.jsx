import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Home from './pages/client/Home';

// Client Pages (Cart, Checkout, Success)
import Cart from './pages/client/Cart';       
import Checkout from './pages/client/Checkout';
import OrderSuccess from './pages/client/OrderSuccess'; 

// Client Side Pages
import ClientProductDetails from './pages/client/ProductDetails'; 
import MyAccount from './pages/client/MyAccount'; 

// Import Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import HomeBannersList from './pages/admin/HomeBannersList';
import AddHomeSlide from './pages/admin/AddHomeSlide';

// Product Pages (Admin)
import ProductList from './pages/admin/product/ProductList';
import AddProduct from './pages/admin/product/AddProduct';
import EditProduct from './pages/admin/product/EditProduct'; 
import AdminProductDetails from './pages/admin/product/ProductDetails'; 

// Category Pages
import CategoryList from './pages/admin/category/CategoryList';
import AddCategory from './pages/admin/category/AddCategory';

// Sub Category Pages
import SubCategoryList from './pages/admin/category/SubCategoryList';
import AddSubCategory from './pages/admin/category/AddSubCategory';

// Banner Pages
import BannerList1 from './pages/admin/banners/BannerList1';
import AddBanner1 from './pages/admin/banners/AddBanner1';
import BannerList2 from './pages/admin/banners/BannerList2';
import AddBanner2 from './pages/admin/banners/AddBanner2';

import UserList from './pages/admin/user/UserList';
import AdminOrders from './pages/admin/orders/AdminOrders';

// ✅ NEW: Import Manage Logo Page
import ManageLogo from './pages/admin/ManageLogo'; 

// Import Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// --- Protection Component ---
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  if (requiredRole && userRole !== requiredRole) return <Navigate to="/" />;
  return children;
};

// --- Placeholder ---
const Placeholder = ({ title }) => (
  <div className="p-10 text-center">
    <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
    <p className="text-gray-500 mt-2">This page is under construction.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          {/* --- Main Layout Routes (Client Store) --- */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Client View: Product Details */}
            <Route path="/product/:id" element={<ClientProductDetails />} />

            {/* Shop & Utility Routes */}
            <Route path="/shop" element={<Placeholder title="Shop / Categories" />} />
            <Route path="/search" element={<Placeholder title="Search Products" />} />
            
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
            <Route path="/orders" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
            
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

            {/* ✅ NEW: Logo Management Route */}
            <Route path="logo" element={<ManageLogo />} />

            {/* User Management */}
            <Route path="users" element={<UserList />} />

            {/* Admin Orders */}
            <Route path="orders" element={<AdminOrders />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;