import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Search, Star, ChevronLeft, ChevronRight, Eye, Loader, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { getProducts, deleteProduct } from '../../../services/productService';
import { getCategories } from '../../../services/categoryService';
import { db } from '../../../config/firebase'; 
import { collection, getDocs } from 'firebase/firestore';

// ✅ Imports for Exporting
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [salesData, setSalesData] = useState({}); 
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [availableSubCats, setAvailableSubCats] = useState([]); 

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          getProducts(),
          getCategories()
        ]);
        setProducts(prodData);
        setCategories(catData);
        
        // Calculate Real Sales
        await fetchRealSales();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Handle Category Change (Populate Subcategories)
  useEffect(() => {
    if (selectedCategory) {
      const categoryObj = categories.find(c => c.id === selectedCategory);
      
      if (categoryObj && categoryObj.subCategories) {
        const subs = categoryObj.subCategories.map(s => 
          typeof s === 'object' ? s.name : s
        );
        setAvailableSubCats(subs);
      } else {
        setAvailableSubCats([]);
      }
    } else {
      setAvailableSubCats([]);
    }
    setSelectedSubCategory(''); 
  }, [selectedCategory, categories]);

  // 3. ROBUST SALES CALCULATION
  const fetchRealSales = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      
      let totals = {};
      querySnapshot.forEach((doc) => {
        const order = doc.data();
        const status = order.status ? order.status.toLowerCase() : '';
        
        if (status === 'delivered') {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach((item) => {
                    const prodId = item.id;
                    const qty = Number(item.quantity) || 0;
                    totals[prodId] = (totals[prodId] || 0) + qty;
                });
            } else if (order.products && Array.isArray(order.products)) {
                order.products.forEach((item) => {
                    const prodId = item.id;
                    const qty = Number(item.quantity) || 0;
                    totals[prodId] = (totals[prodId] || 0) + qty;
                });
            }
        }
      });
      setSalesData(totals);
    } catch (error) {
      console.error("Error calculating real sales:", error);
    }
  };

  // 4. Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesSubCategory = selectedSubCategory 
        ? (p.subCategoryName === selectedSubCategory || p.subCategory === selectedSubCategory)
        : true;
    
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  // 5. Helper to get Real Rating
  const getAverageRating = (product) => {
    if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
        const total = product.reviews.reduce((acc, review) => acc + (Number(review.rating) || 0), 0);
        return total / product.reviews.length;
    }
    return Number(product.rating) || 0;
  };

  // ✅ EXPORT TO EXCEL FUNCTION
  const downloadExcel = () => {
    const dataToExport = filteredProducts.map(p => ({
        "Product Name": p.name,
        "Price": p.price,
        "Stock Quantity": p.stock,
        "Category": p.categoryName || '-',
        "Image Link": p.imageUrl || 'No Image'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "Product_Inventory.xlsx");
  };

  // ✅ EXPORT TO PDF FUNCTION
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.text("Product Inventory List", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["Product Name", "Price", "Stock", "Category", "Image Link"];
    const tableRows = filteredProducts.map(p => [
        p.name,
        `Rs. ${p.price}`,
        p.stock,
        p.categoryName || '-',
        p.imageUrl || 'No Image'
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { fontSize: 8 },
        columnStyles: {
            4: { cellWidth: 50 } // Make image link column wider
        }
    });

    doc.save("Product_Inventory.pdf");
  };

  // Pagination Logic
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
        
        {/* ✅ ADDED EXPORT BUTTONS & ADD PRODUCT BUTTON */}
        <div className="flex items-center gap-3">
            <button 
                onClick={downloadExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded shadow-sm font-bold text-sm transition-colors uppercase"
                title="Download Excel"
            >
                <FileSpreadsheet size={16} /> <span className="hidden sm:inline">Excel</span>
            </button>
            
            <button 
                onClick={downloadPDF}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded shadow-sm font-bold text-sm transition-colors uppercase"
                title="Download PDF"
            >
                <FileText size={16} /> <span className="hidden sm:inline">PDF</span>
            </button>

            <Link to="/admin/products/add">
            <button className="bg-[#7D2596] hover:bg-[#631d76] text-white px-6 py-2.5 rounded shadow-sm font-bold text-sm transition-colors uppercase flex items-center gap-2">
                <Edit2 size={16} /> Add Product
            </button>
            </Link>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> 
          
          {/* Category Filter */}
          <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Category By</label>
              <select 
                className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-600 outline-none focus:border-[#7D2596] bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
             >
                <option value="">Show All</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>

          {/* Sub Category Filter (Dynamic) */}
          <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">Sub Category By</label>
              <select 
                className="w-full border border-gray-300 rounded p-2.5 text-sm text-gray-600 outline-none focus:border-[#7D2596] bg-white disabled:bg-gray-50 disabled:text-gray-400"
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                disabled={!selectedCategory || availableSubCats.length === 0}
             >
                <option value="">Show All</option>
                {availableSubCats.map((sub, index) => (
                    <option key={index} value={sub}>
                        {sub}
                    </option>
                ))}
             </select>
          </div>

          {/* Search */}
          <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700">&nbsp;</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded text-sm outline-none focus:border-[#7D2596] bg-gray-50"
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
                <th className="p-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300 accent-[#7D2596]" /></th>
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
                <tr><td colSpan="9" className="p-10 text-center text-[#7D2596]"><div className="flex justify-center items-center gap-2"><Loader className="animate-spin" size={20}/> Loading products...</div></td></tr>
              ) : currentRows.length === 0 ? (
                <tr><td colSpan="9" className="p-10 text-center text-gray-500">No products found.</td></tr>
              ) : (
                currentRows.map((p) => {
                  const ratingValue = getAverageRating(p);
                  
                  return (
                  <tr key={p.id} className="hover:bg-purple-50/20 transition-colors group">
                    <td className="p-4 text-center"><input type="checkbox" className="rounded border-gray-300 accent-[#7D2596]" /></td>
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
                    <td className="p-4 text-gray-600">{p.subCategoryName || p.subCategory || '-'}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                         {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                            <span className="text-[11px] text-gray-400 line-through font-medium">₹{p.originalPrice}</span>
                         )}
                         <span className="text-sm font-bold text-[#7D2596]">₹{p.price}</span>
                      </div>
                    </td>

                    {/* REAL SALES */}
                    <td className="p-4">
                        <span className={`font-bold ${salesData[p.id] > 0 ? 'text-[#7D2596]' : 'text-gray-400'}`}>
                          {salesData[p.id] || 0}
                        </span> 
                        <span className="text-xs text-gray-400 ml-1">sold</span>
                    </td>

                    <td className="p-4">
                        <span className={`font-bold ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {p.stock || 0}
                        </span>
                    </td>
                    
                    {/* REAL RATING */}
                    <td className="p-4">
                      <div className="flex text-yellow-400" title={`Rating: ${ratingValue.toFixed(1)}`}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.round(ratingValue) ? "currentColor" : "none"} className={i >= Math.round(ratingValue) ? "text-gray-300" : ""} />
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
                )})
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
                 className="border border-gray-300 rounded p-1 outline-none bg-gray-50 focus:border-[#7D2596]"
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