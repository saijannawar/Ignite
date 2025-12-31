import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Search, Star, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { getProducts, deleteProduct } from '../../../services/productService';
import { getCategories } from '../../../services/categoryService';
import { db } from '../../../config/firebase'; // Ensure your firebase config is imported
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [salesData, setSalesData] = useState({}); // Stores real sales count
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 1. Fetch Data (Products, Categories, and Real Sales)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(prodData);
        setCategories(catData);
        
        // Calculate Real Sales from Orders
        await fetchRealSales();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // NEW: Logic to calculate real sales based on Delivered orders
  const fetchRealSales = async () => {
    try {
      const ordersRef = collection(db, "orders");
      // Only count sales for orders that are completed/delivered
      const q = query(ordersRef, where("status", "==", "Delivered"));
      const querySnapshot = await getDocs(q);
      
      let totals = {};
      querySnapshot.forEach((doc) => {
        const order = doc.data();
        if (order.products && Array.isArray(order.products)) {
          order.products.forEach((item) => {
            // item.id should match the product ID
            const prodId = item.id;
            const qty = Number(item.quantity) || 0;
            totals[prodId] = (totals[prodId] || 0) + qty;
          });
        }
      });
      setSalesData(totals);
    } catch (error) {
      console.error("Error calculating real sales:", error);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredProducts.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        alert("Failed to delete product");
      }
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <Link to="/admin/products/add">
          <button className="bg-[#3b82f6] hover:bg-blue-600 text-white px-6 py-2.5 rounded shadow-sm font-bold text-sm transition-colors uppercase">
            Add Product
          </button>
        </Link>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-700">Category By</label>
             <select 
                className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-600 outline-none focus:border-blue-500 bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
             >
                <option value="">Show All</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-700">Sub Category By</label>
             <select className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-600 outline-none focus:border-blue-500 bg-white">
                <option value="">Show All</option>
             </select>
          </div>
          <div className="space-y-1 opacity-60">
             <label className="text-xs font-bold text-gray-700">Third Level Category</label>
             <select className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-600 outline-none bg-gray-50" disabled>
                <option>Select...</option>
             </select>
          </div>
          <div className="space-y-1">
             <label className="text-xs font-bold text-gray-700">&nbsp;</label>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search here..." 
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 bg-gray-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search size={16} className="absolute left-3 top-3 text-gray-400" />
             </div>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fa] border-b border-gray-200">
              <tr>
                <th className="p-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Product</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Category</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Sub Category</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Price</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Sales</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Stock</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Rating</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="9" className="p-10 text-center text-gray-500">Loading products...</td></tr>
              ) : currentRows.length === 0 ? (
                <tr><td colSpan="9" className="p-10 text-center text-gray-500">No products found.</td></tr>
              ) : (
                currentRows.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="p-4">
                      <div className="flex gap-4 items-center min-w-[250px]">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 p-0.5 flex-shrink-0">
                          <img src={p.imageUrl} alt="" className="w-full h-full object-cover rounded-md" />
                        </div>
                        <div className="flex flex-col">
                           <span className="font-bold text-gray-800 text-[13px] leading-tight line-clamp-2">{p.name}</span>
                           <span className="text-xs text-gray-500 mt-0.5">{p.brand || 'No Brand'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{p.categoryName || '-'}</td>
                    <td className="p-4 text-gray-600">{p.subCategoryName || '-'}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                         {p.oldPrice && <span className="text-[11px] text-gray-400 line-through font-medium">₹{p.oldPrice}</span>}
                         <span className="text-sm font-bold text-[#3b82f6]">₹{p.price}</span>
                      </div>
                    </td>

                    {/* UPDATED: Real Sales Section */}
                    <td className="p-4">
                       <span className="font-bold text-gray-800">
                         {salesData[p.id] || 0}
                       </span> 
                       <span className="text-xs text-gray-400 ml-1">sale</span>
                    </td>

                    <td className="p-4">
                       <span className={`font-bold ${p.stock > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                         {p.stock || 0}
                       </span>
                    </td>
                    <td className="p-4">
                      <div className="flex text-yellow-400">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} size={14} fill={i < (p.rating || 0) ? "currentColor" : "none"} className={i >= (p.rating||0) ? "text-gray-300" : ""} />
                         ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/admin/products/edit/${p.id}`}>
                           <button className="p-2 bg-green-50 text-green-600 rounded hover:bg-green-100 border border-green-200 transition-colors">
                             <Edit2 size={16}/>
                           </button>
                        </Link>
                        <Link to={`/admin/products/view/${p.id}`}>
                           <button className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 border border-blue-200 transition-colors">
                             <Eye size={16}/>
                           </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(p.id)} 
                          className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 border border-red-200 transition-colors"
                        >
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center gap-4 text-xs text-gray-600 bg-white">
            <div className="flex items-center gap-2">
               <span>Rows per page:</span>
               <select 
                 value={rowsPerPage} 
                 onChange={(e) => setRowsPerPage(Number(e.target.value))}
                 className="border border-gray-300 rounded p-1 outline-none bg-gray-50"
               >
                 <option value={10}>10</option>
                 <option value={25}>25</option>
                 <option value={50}>50</option>
               </select>
            </div>
            <span>
               {filteredProducts.length === 0 ? '0-0 of 0' : 
                 `${indexOfFirstRow + 1}-${Math.min(indexOfLastRow, filteredProducts.length)} of ${filteredProducts.length}`
               }
            </span>
            <div className="flex gap-1">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50">
                  <ChevronRight size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}