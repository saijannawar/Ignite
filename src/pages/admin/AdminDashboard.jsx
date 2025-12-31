import React, { useEffect, useState } from 'react';
import { Plus, Users, ShoppingBag, Package, Grid, Search, Star, MoreVertical, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase'; // ✅ Make sure this path is correct!

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats State
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    categories: 0
  });

  // Graph Data State
  const [graphData, setGraphData] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // --- 1. Fetch Products ---
        // NOTE: Check if your collection is named "products" or "Products" in Firebase
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Products Fetched:", productsList.length);

        // --- 2. Fetch Categories ---
        const categorySnapshot = await getDocs(collection(db, "categories")); 
        console.log("Categories Fetched:", categorySnapshot.size);

        // --- 3. Fetch Users ---
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                ...data, 
                // Safety check: Convert Firestore Timestamp to JS Date if it exists
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()) 
            };
        });
        console.log("Users Fetched:", usersList.length);

        // --- 4. Fetch Orders ---
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        const ordersList = ordersSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data, 
                // Safety check: Convert Firestore Timestamp
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()) 
            };
        });
        
        // Sort orders by date (newest first) for the "Recent Orders" table
        const sortedOrders = ordersList.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
        
        console.log("Orders Fetched:", ordersList.length);

        // --- Set Counts ---
        setStats({
          users: usersSnapshot.size,
          orders: ordersSnapshot.size,
          products: productsSnapshot.size,
          categories: categorySnapshot.size
        });

        // --- Set Tables ---
        setProducts(productsList);
        setRecentOrders(sortedOrders);

        // --- Process Graph Data ---
        const processedGraphData = processGraphData(ordersList, usersList);
        setGraphData(processedGraphData);

      } catch (error) {
        console.error("🔥 Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Helper: Process Data for Recharts
  const processGraphData = (orders, users) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUNE', 'JULY', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    // Initialize data with 0
    const data = months.map(month => ({ name: month, sales: 0, users: 0 }));

    const currentYear = new Date().getFullYear();

    // Aggregate Sales
    orders.forEach(order => {
      // Check if createdAt is a valid date object
      if (order.createdAt && order.createdAt.getFullYear() === currentYear) {
        const monthIndex = order.createdAt.getMonth();
        const amount = parseFloat(order.totalAmount || order.amount || 0); 
        data[monthIndex].sales += amount;
      }
    });

    // Aggregate Users
    users.forEach(user => {
        if (user.createdAt && user.createdAt.getFullYear() === currentYear) {
            const monthIndex = user.createdAt.getMonth();
            data[monthIndex].users += 1;
        }
    });

    return data;
  };

  // Helper: Format Date safely
  const formatDate = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return 'N/A';
    return dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Welcome Banner */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="z-10 relative">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, <br /><span className="text-[#3b82f6]">Sai Jannawar (SAJ)</span></h1>
          <p className="text-gray-500 mb-6 text-sm">Here's what happening on your store today. See the statistics at once.</p>
          <Link to="/admin/products/add">
            <button className="bg-[#3b82f6] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all">
              <Plus size={18} /> Add Product
            </button>
          </Link>
        </div>
        <div className="hidden md:block absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value={stats.users} color="bg-[#10b981]" icon={<Users size={20} />} chart={true} />
        <StatsCard title="Total Orders" value={stats.orders} color="bg-[#3b82f6]" icon={<ShoppingBag size={20} />} chart={false} />
        <StatsCard title="Total Products" value={stats.products} color="bg-[#8b5cf6]" icon={<Package size={20} />} chart={true} />
        <StatsCard title="Total Category" value={stats.categories} color="bg-[#f43f5e]" icon={<Grid size={20} />} chart={true} />
      </div>

      {/* 3. Products Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Products</h2>
        </div>
        <div className="p-5 bg-gray-50/50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          <FilterSelect label="Category By" />
          <FilterSelect label="Sub Category By" />
          <FilterSelect label="Third Level Sub Category By" />
          <div className="relative">
            <input type="text" placeholder="Search here..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 bg-white text-gray-600 placeholder-gray-400" />
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fa] text-gray-500 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Sub Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Sales</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Rating</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700 divide-y divide-gray-50 bg-white">
              {loading ? (
                <tr><td colSpan="9" className="p-8 text-center text-gray-500">Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="9" className="p-8 text-center text-gray-500">No products found.</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-center"><input type="checkbox" className="rounded border-gray-300 cursor-pointer" /></td>
                    <td className="p-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                          {/* Handles multiple image structures: direct URL or array */}
                          <img src={product.imageUrl || (product.images && product.images[0]) || 'https://via.placeholder.com/50'} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col"><span className="font-semibold text-gray-800 text-[13px] leading-tight line-clamp-1">{product.name}</span><span className="text-xs text-gray-500 mt-0.5">{product.brand || 'Brand Name'}</span></div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4 text-gray-600">{product.subCategory || '-'}</td>
                    <td className="p-4"><div className="flex flex-col"><span className="text-xs text-gray-400 line-through font-medium">₹{parseFloat(product.price || 0) + 200}</span><span className="text-[#3b82f6] font-bold text-sm">₹{product.price}</span></div></td>
                    <td className="p-4 font-medium">{product.sales || 0} <span className="text-gray-400 text-xs font-normal">sale</span></td>
                    <td className="p-4 text-[#3b82f6] font-medium">{product.stock || 0}</td>
                    <td className="p-4"><div className="flex text-yellow-400"><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="currentColor" /><Star size={14} fill="none" /></div></td>
                    <td className="p-4 text-center"><button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><MoreVertical size={16} /></button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          <div className="relative w-full md:w-80">
            <input type="text" placeholder="Search here..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded bg-gray-50 text-sm outline-none focus:border-blue-500 text-gray-600" />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#212b36] text-gray-400 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4 w-10"></th><th className="p-4">Order ID</th><th className="p-4">Payment ID</th><th className="p-4">Name</th><th className="p-4">Phone Number</th><th className="p-4 w-64">Address</th><th className="p-4">Pincode</th><th className="p-4">Total Amount</th><th className="p-4">Email</th><th className="p-4">User ID</th><th className="p-4">Order Status</th><th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="bg-[#26313c] text-gray-300 text-xs font-medium divide-y divide-[#323d49]">
              {loading ? (
                 <tr><td colSpan="12" className="p-8 text-center text-gray-400">Loading orders...</td></tr>
              ) : recentOrders.length === 0 ? (
                 <tr><td colSpan="12" className="p-8 text-center text-gray-400">No recent orders found.</td></tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#2d3a46] transition-colors">
                    <td className="p-4 text-center"><button className="bg-[#374452] p-1 rounded-full text-white hover:bg-gray-600"><ChevronDown size={14} /></button></td>
                    <td className="p-4 text-[#4fa1f9] hover:underline cursor-pointer">{order.id.slice(0, 10)}...</td>
                    <td className="p-4 text-[#4fa1f9] uppercase">{order.paymentId || 'COD'}</td>
                    {/* Handles varied data structure for Name/Phone/Address */}
                    <td className="p-4">{order.shippingInfo?.fullName || order.name || 'N/A'}</td>
                    <td className="p-4">{order.shippingInfo?.phone || order.phone || 'N/A'}</td>
                    <td className="p-4"><div className="flex flex-col gap-1"><span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.5 rounded w-fit font-bold">{order.type || 'Home'}</span><span className="line-clamp-2 leading-tight text-gray-400">{order.shippingInfo?.address || order.address || 'N/A'}</span></div></td>
                    <td className="p-4">{order.shippingInfo?.pincode || order.pincode}</td>
                    <td className="p-4">₹{order.totalAmount || order.amount}</td>
                    <td className="p-4 text-gray-400">{order.email || 'N/A'}</td>
                    <td className="p-4 text-[#4fa1f9] hover:underline cursor-pointer truncate max-w-[100px]">{order.userId}</td>
                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white ${order.status === 'Delivered' ? 'bg-green-600' : 'bg-green-500'}`}>{order.status || 'Pending'}</span></td>
                    <td className="p-4 text-gray-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. GRAPH SECTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">Total Users & Total Sales (Current Year)</h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={graphData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} />
              <Tooltip cursor={{ fill: '#f4f6f8' }} />
              <Legend iconType="circle" wrapperStyle={{ top: -20, left: 0 }} />
              <Bar dataKey="users" name="Total Users" fill="#3b82f6" barSize={30} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sales" name="Total Sales" fill="#10b981" barSize={30} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

// Helper Components
const StatsCard = ({ title, value, color, icon, chart }) => (
  <div className={`${color} rounded-lg p-6 text-white flex items-center justify-between shadow-lg shadow-black/5 relative overflow-hidden group`}>
    <div className="z-10 relative">
      <div className="flex items-center gap-2 mb-2 opacity-90">{icon} <span className="text-sm font-medium">{title}</span></div>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </div>
    {chart ? (<div className="opacity-40 transform scale-125 origin-bottom-right"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg></div>) : (<div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center opacity-60"><span className="text-xs font-bold">50%</span></div>)}
  </div>
);

const FilterSelect = ({ label }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 ml-1">{label}</label>
        <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer"><option>Select...</option></select>
    </div>
);