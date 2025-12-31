import React, { useEffect, useState } from 'react';
import { Search, Trash2, Phone, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllUsers, deleteUser } from '../../../services/userService';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 1. Fetch Users on Mount
  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getAllUsers();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // 2. Filter Logic
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Pagination Logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  // Delete Handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        alert("Failed to delete user.");
      }
    }
  };

  // Helper to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Handle Firestore Timestamp or standard Date string
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Users List</h2>
        <div className="relative w-full md:w-80">
           <input 
             type="text" 
             placeholder="Search here..." 
             className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-gray-50 focus:border-blue-500"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
           <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8f9fa] border-b border-gray-200">
              <tr>
                <th className="p-4 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">User</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">User Phone No</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase">Created</th>
                <th className="p-4 text-xs font-bold text-gray-600 uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading users...</td></tr>
              ) : currentRows.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td></tr>
              ) : (
                currentRows.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
                    
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex gap-4 items-center">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-300">
                           {user.photoURL ? (
                             <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <User size={20} />
                           )}
                        </div>
                        {/* Name & Email */}
                        <div className="flex flex-col">
                           <span className="font-bold text-gray-800 text-sm">{user.name || user.displayName || 'Unknown User'}</span>
                           <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="p-4">
                       <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          <span>{user.phone || user.phoneNumber || '*********'}</span>
                       </div>
                    </td>

                    {/* Created Date */}
                    <td className="p-4">
                       <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{formatDate(user.createdAt || user.metadata?.creationTime)}</span>
                       </div>
                    </td>

                    {/* Action Button */}
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="px-3 py-1.5 border border-red-200 text-red-500 text-xs font-bold rounded hover:bg-red-50 transition-colors uppercase"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end items-center gap-4 text-xs text-gray-600">
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
              {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <div className="flex gap-1">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
            </div>
        </div>
      </div>
    </div>
  );
}