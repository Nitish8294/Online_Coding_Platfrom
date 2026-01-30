import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient'
import { User, Shield, Mail, Search, Calendar, Trophy, Clock } from 'lucide-react';

const AdminUsers = () => {
         const [users, setUsers] = useState([]);
         const [filteredUsers, setFilteredUsers] = useState([]);
         const [loading, setLoading] = useState(true);
         const [error, setError] = useState(null);
         const [searchTerm, setSearchTerm] = useState('');

         useEffect(() => {
                  fetchUsers();
         }, []);

         useEffect(() => {
                  const lowerTerm = searchTerm.toLowerCase();
                  const filtered = users.filter(user =>
                           user.firstName?.toLowerCase().includes(lowerTerm) ||
                           user.lastName?.toLowerCase().includes(lowerTerm) ||
                           user.emailId?.toLowerCase().includes(lowerTerm) ||
                           user.role?.toLowerCase().includes(lowerTerm)
                  );
                  setFilteredUsers(filtered);
         }, [searchTerm, users]);

         const fetchUsers = async () => {
                  try {
                           setLoading(true);
                           const { data } = await axiosClient.get('/user/getalluser');
                           setUsers(data);
                           setFilteredUsers(data);
                  } catch (err) {
                           setError('Failed to fetch users');
                           console.error(err);
                  } finally {
                           setLoading(false);
                  }
         };

         const getRoleBadge = (role) => {
                  if (role === 'admin') return <span className="badge badge-primary gap-1"><Shield size={12} /> Admin</span>;
                  return <span className="badge badge-ghost gap-1"><User size={12} /> User</span>;
         };

         const formatDate = (dateString) => {
                  if (!dateString) return 'N/A';
                  return new Date(dateString).toLocaleDateString(undefined, {
                           year: 'numeric',
                           month: 'short',
                           day: 'numeric'
                  });
         };

         if (loading) return (
                  <div className="min-h-screen bg-slate-950 flex justify-center items-center">
                           <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
         );

         return (
                  <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans">
                           <div className="max-w-7xl mx-auto">
                                    {/* Header */}
                                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                                             <div>
                                                      <h1 className="text-3xl font-bold text-white">Manage Users</h1>
                                                      <p className="text-slate-400">View detailed information of registered users.</p>
                                             </div>
                                             <div className="relative w-full md:w-72">
                                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                      <input
                                                               type="text"
                                                               placeholder="Search users..."
                                                               className="input input-bordered bg-slate-900 border-slate-700 pl-10 w-full focus:border-indigo-500"
                                                               value={searchTerm}
                                                               onChange={(e) => setSearchTerm(e.target.value)}
                                                      />
                                             </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                             <div className="stats shadow bg-slate-900 border border-slate-800 text-slate-200">
                                                      <div className="stat">
                                                               <div className="stat-figure text-primary">
                                                                        <User size={32} />
                                                               </div>
                                                               <div className="stat-title text-slate-400">Total Users</div>
                                                               <div className="stat-value text-primary">{users.length}</div>
                                                      </div>
                                             </div>
                                             <div className="stats shadow bg-slate-900 border border-slate-800 text-slate-200">
                                                      <div className="stat">
                                                               <div className="stat-figure text-secondary">
                                                                        <Shield size={32} />
                                                               </div>
                                                               <div className="stat-title text-slate-400">Admins</div>
                                                               <div className="stat-value text-secondary">{users.filter(u => u.role === 'admin').length}</div>
                                                      </div>
                                             </div>
                                             <div className="stats shadow bg-slate-900 border border-slate-800 text-slate-200">
                                                      <div className="stat">
                                                               <div className="stat-figure text-accent">
                                                                        <Trophy size={32} />
                                                               </div>
                                                               <div className="stat-title text-slate-400">Total Solved</div>
                                                               <div className="stat-value text-accent">
                                                                        {users.reduce((acc, user) => acc + (user.problemSolved?.length || 0), 0)}
                                                               </div>
                                                      </div>
                                             </div>
                                    </div>

                                    {/* Table */}
                                    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                             <div className="overflow-x-auto">
                                                      <table className="table w-full">
                                                               <thead className="bg-slate-950/50 border-b border-slate-800">
                                                                        <tr>
                                                                                 <th className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4 w-12">#</th>
                                                                                 <th className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">User Details</th>
                                                                                 <th className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Status & Role</th>
                                                                                 <th className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Activity</th>
                                                                                 <th className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Joined</th>
                                                                        </tr>
                                                               </thead>
                                                               <tbody className="divide-y divide-slate-800">
                                                                        {filteredUsers.map((user, index) => (
                                                                                 <tr key={user._id} className="hover:bg-slate-800/40 transition-colors">
                                                                                          <td className="py-4 font-mono text-slate-500 text-xs">
                                                                                                   {index + 1}
                                                                                          </td>
                                                                                          <td className="py-4">
                                                                                                   <div className="flex items-center gap-3">
                                                                                                            <div className="avatar placeholder">
                                                                                                                     <div className="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30">
                                                                                                                              {user.firstName?.charAt(0).toUpperCase()}
                                                                                                                     </div>
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                     <div className="font-bold text-white flex gap-2 items-center">
                                                                                                                              {user.firstName} {user.lastName}
                                                                                                                              {user.age && <span className="badge badge-xs badge-outline text-slate-500">Age: {user.age}</span>}
                                                                                                                     </div>
                                                                                                                     <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                                                                                              <Mail size={10} /> {user.emailId}
                                                                                                                     </div>
                                                                                                                     <div className="text-[10px] text-slate-600 font-mono mt-0.5 opacity-60">ID: {user._id}</div>
                                                                                                            </div>
                                                                                                   </div>
                                                                                          </td>
                                                                                          <td className="py-4">
                                                                                                   <div className="flex flex-col items-start gap-1">
                                                                                                            {getRoleBadge(user.role)}
                                                                                                            <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
                                                                                                   </div>
                                                                                          </td>
                                                                                          <td className="py-4">
                                                                                                   <div className="flex items-center gap-2" title="Problems Solved">
                                                                                                            <Trophy size={16} className="text-amber-400" />
                                                                                                            <span className="font-bold text-slate-200">{user.problemSolved?.length || 0}</span>
                                                                                                            <span className="text-xs text-slate-500">problems solved</span>
                                                                                                   </div>
                                                                                          </td>
                                                                                          <td className="py-4 text-slate-400 text-sm">
                                                                                                   <div className="flex items-center gap-2">
                                                                                                            <Calendar size={14} className="opacity-70" />
                                                                                                            {formatDate(user.createdAt)}
                                                                                                   </div>
                                                                                                   <div className="text-xs opacity-50 pl-6">
                                                                                                            {new Date(user.createdAt).toLocaleTimeString()}
                                                                                                   </div>
                                                                                          </td>
                                                                                 </tr>
                                                                        ))}
                                                                        {filteredUsers.length === 0 && (
                                                                                 <tr>
                                                                                          <td colSpan="5" className="text-center py-12 text-slate-500">
                                                                                                   No users found matching your search.
                                                                                          </td>
                                                                                 </tr>
                                                                        )}
                                                               </tbody>
                                                      </table>
                                             </div>
                                    </div>
                           </div>
                  </div>
         );
};

export default AdminUsers;
