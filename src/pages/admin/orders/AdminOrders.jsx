import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../../services/productService'; 
import { Trash2, ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Change this to show more/less items

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      // Sort latest first
      const sorted = data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
      setOrders(sorted);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handlers
  const handleStatusChange = async (orderId, newStatus) => {
    const originalOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      alert("Failed to update status");
      setOrders(originalOrders);
    }
  };

  const handleDelete = async (orderId) => {
    if(!window.confirm("Delete this order?")) return;
    try {
      await deleteOrder(orderId);
      const newOrders = orders.filter(o => o.id !== orderId);
      setOrders(newOrders);
      
      // Adjust page if we deleted the last item on a page
      const newTotalPages = Math.ceil(newOrders.length / itemsPerPage);
      if (currentPage > newTotalPages) setCurrentPage(Math.max(1, newTotalPages));
      
    } catch (error) {
      alert("Failed to delete order");
    }
  };

  // --- FILTERING & PAGINATION LOGIC ---
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Generate Page Numbers Array (with ellipsis logic)
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  // --- EXPANDABLE ROW COMPONENT ---
  const AdminOrderRow = ({ order }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <div className="bg-[#232f3e] text-gray-300 text-xs mb-2 rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600">
          <div className="min-w-[1400px] flex items-center border-b border-gray-700 py-4 px-4 hover:bg-[#2c3e50] transition-colors">
            
            <div className="w-12 flex-shrink-0 flex justify-center">
              <button onClick={() => setExpanded(!expanded)} className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-800 hover:bg-gray-200 transition-colors">
                {expanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
              </button>
            </div>

            <div className="w-48 flex-shrink-0 px-2 text-[#3498db] font-bold truncate" title={order.id}>{order.id}</div>
            <div className="w-40 flex-shrink-0 px-2 text-[#3498db] font-bold uppercase">{order.paymentMethod || 'COD'}</div>
            <div className="w-32 flex-shrink-0 px-2 truncate text-gray-300">{order.customerName}</div>
            <div className="w-32 flex-shrink-0 px-2 text-gray-300">{order.address?.phone}</div>
            <div className="w-64 flex-shrink-0 px-2">
              <div className="flex flex-col items-start gap-1">
                <span className="bg-gray-200 text-gray-800 text-[9px] font-bold px-1 rounded">{order.address?.type || 'Home'}</span>
                <span className="truncate w-full block" title={order.address?.line1}>{order.address?.line1}, {order.address?.city}</span>
              </div>
            </div>
            <div className="w-24 flex-shrink-0 px-2">{order.address?.pincode}</div>
            <div className="w-24 flex-shrink-0 px-2 font-bold text-white">₹{order.total}</div>
            <div className="w-48 flex-shrink-0 px-2 truncate" title={order.email}>{order.email}</div>
            <div className="w-48 flex-shrink-0 px-2 truncate text-blue-400" title={order.userId}>{order.userId}</div>

            <div className="w-32 flex-shrink-0 px-2 text-center">
              <select 
                value={order.status || 'Processing'} 
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="bg-white text-gray-800 text-[10px] font-bold py-1 px-2 rounded w-full outline-none cursor-pointer border border-transparent hover:border-gray-400"
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="w-24 flex-shrink-0 px-2 text-right text-gray-400">{order.date || order.createdAt?.slice(0,10)}</div>
            <div className="w-24 flex-shrink-0 px-2 flex justify-center">
               <button onClick={() => handleDelete(order.id)} className="bg-red-900/30 border border-red-800 text-red-500 hover:bg-red-600 hover:text-white px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors">Delete</button>
            </div>
          </div>
        </div>

        {expanded && (
          <div className="bg-[#2a3645] p-4 border-t border-gray-600 animate-in slide-in-from-top-2 shadow-inner">
            <div className="flex text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-600 pb-2 pl-12">
              <div className="w-48">Product ID</div><div className="flex-1">Product Title</div><div className="w-24 text-center">Image</div><div className="w-24 text-center">Quantity</div><div className="w-24 text-right">Price</div><div className="w-24 text-right">Sub Total</div>
            </div>
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center text-gray-300 py-3 border-b border-gray-600/50 last:border-0 pl-12 hover:bg-[#324050] transition-colors">
                <div className="w-48 truncate pr-2 opacity-60 text-[10px]">{item.id || item.productId}</div>
                <div className="flex-1 font-medium text-blue-200 text-xs">{item.name}</div>
                <div className="w-24 flex justify-center"><div className="w-8 h-8 bg-white rounded p-0.5 flex items-center justify-center"><img src={item.imageUrl || item.images?.[0]} alt="" className="max-w-full max-h-full object-contain" /></div></div>
                <div className="w-24 text-center">{item.quantity}</div>
                <div className="w-24 text-right">₹{item.price}</div>
                <div className="w-24 text-right font-bold text-white">₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-[#f4f6f8] min-h-screen font-sans">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
        <div className="relative w-full sm:w-72">
          <input 
            type="text" 
            placeholder="Search orders..." 
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-[#ff4d4d] outline-none transition-all"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} // Reset to page 1 on search
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={16} />
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden pb-4">
        
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium">Loading orders data...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-medium">No orders found matching your search.</div>
        ) : (
          <div className="p-4">
            
            {/* Header Columns */}
            <div className="hidden lg:block bg-[#343a40] text-gray-400 text-[10px] font-bold uppercase tracking-wider py-3 px-4 rounded-t-sm mb-1">
               <div className="flex items-center min-w-[1400px] overflow-x-auto">
                  <div className="w-12 text-center">#</div>
                  <div className="w-48 px-2">Order ID</div>
                  <div className="w-40 px-2">Payment ID</div>
                  <div className="w-32 px-2">Name</div>
                  <div className="w-32 px-2">Phone</div>
                  <div className="w-64 px-2">Address</div>
                  <div className="w-24 px-2">Pincode</div>
                  <div className="w-24 px-2">Total</div>
                  <div className="w-48 px-2">Email</div>
                  <div className="w-48 px-2">User ID</div>
                  <div className="w-32 px-2 text-center">Status</div>
                  <div className="w-24 px-2 text-right">Date</div>
                  <div className="w-24 px-2 text-center">Action</div>
               </div>
            </div>

            {/* ✅ Render CURRENT PAGE Orders Only */}
            {currentOrders.map(order => (
              <AdminOrderRow key={order.id} order={order} />
            ))}

            {/* ✅ REAL PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 select-none">
                
                {/* First Page */}
                <button 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600"
                >
                  <ChevronsLeft size={16} />
                </button>

                {/* Previous */}
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((pageNum, idx) => (
                  <button 
                    key={idx}
                    onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                    disabled={pageNum === '...'}
                    className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold transition-colors
                      ${pageNum === currentPage 
                        ? 'bg-gray-200 text-gray-900' 
                        : pageNum === '...' ? 'cursor-default text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`
                    }
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Next */}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Last Page */}
                <button 
                  onClick={() => setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-600"
                >
                  <ChevronsRight size={16} />
                </button>

              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}