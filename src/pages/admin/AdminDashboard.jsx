import React, { useEffect, useState } from 'react';
import { db } from '../../config/firebase'; 
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp
} from 'lucide-react';
import Preloader from '../../components/common/Preloader';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Orders to calc Sales & Total Orders
      const ordersSnap = await getDocs(collection(db, "orders"));
      const orders = ordersSnap.docs.map(doc => doc.data());
      
      const totalOrders = orders.length;
      const totalSales = orders.reduce((acc, order) => acc + (Number(order.total) || 0), 0);

      // 2. Fetch Products Count
      const productsSnap = await getDocs(collection(db, "products"));
      const totalProducts = productsSnap.size;

      // 3. Fetch Users Count
      const usersSnap = await getDocs(collection(db, "users"));
      const totalUsers = usersSnap.size;

      setStats({ totalSales, totalOrders, totalProducts, totalUsers });

      // 4. Fetch Recent 5 Orders
      const recentQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
      const recentSnap = await getDocs(recentQuery);
      const recent = recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      setRecentOrders(recent);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper for Status Badge
  const getStatusColor = (status) => {
    const s = (status || 'Processing').toLowerCase();
    if (s === 'delivered') return 'bg-green-100 text-green-700';
    if (s === 'shipped') return 'bg-blue-100 text-blue-700';
    if (s === 'cancelled') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  if (loading) return <Preloader fullScreen={false} text="Loading Dashboard..." />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Sales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-[#7D2596] rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-800">₹{stats.totalSales.toLocaleString()}</h3>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Products</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts}</h3>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Customers</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
          </div>
        </div>
      </div>

      {/* --- RECENT ORDERS TABLE --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Order ID</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                {/* ❌ REMOVED ADDRESS COLUMN TO PREVENT CRASH FOR NOW */}
                {/* Or handle it safely like below */}
                <th className="p-4 font-medium">Location</th> 
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-400">No orders found.</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-700">#{order.orderId ? order.orderId.slice(0,8) : 'ID'}</td>
                    <td className="p-4 text-gray-600">{order.customerName || 'Guest'}</td>
                    <td className="p-4 font-bold text-[#7D2596]">₹{order.total}</td>
                    <td className="p-4 text-gray-500">{order.date}</td>
                    
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status || 'Processing'}
                      </span>
                    </td>

                    {/* ✅ FIX IS HERE: Render only specific property (e.g., city) */}
                    <td className="p-4 text-gray-500">
                       {order.shippingMethod === 'vit' 
                         ? <span className="text-blue-600 font-bold text-xs">COLLEGE PICKUP</span> 
                         : (order.address?.city || 'N/A') // Only show City to avoid object crash
                       }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}