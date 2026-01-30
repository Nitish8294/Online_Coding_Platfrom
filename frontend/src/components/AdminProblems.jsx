import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient'
import { Edit, Trash2, Eye, Search } from 'lucide-react';
import { NavLink } from 'react-router';

const AdminProblems = () => {
         const [problems, setProblems] = useState([]);
         const [filteredProblems, setFilteredProblems] = useState([]);
         const [loading, setLoading] = useState(true);
         const [error, setError] = useState(null);
         const [searchTerm, setSearchTerm] = useState('');

         useEffect(() => {
                  fetchProblems();
         }, []);

         useEffect(() => {
                  const lowerTerm = searchTerm.toLowerCase();
                  const filtered = problems.filter(p =>
                           p.title.toLowerCase().includes(lowerTerm) ||
                           p.tags.toLowerCase().includes(lowerTerm) ||
                           p.difficulty.toLowerCase().includes(lowerTerm)
                  );
                  setFilteredProblems(filtered);
         }, [searchTerm, problems]);

         const fetchProblems = async () => {
                  try {
                           setLoading(true);
                           const { data } = await axiosClient.get('/problem/getAllProblem');
                           setProblems(data);
                           setFilteredProblems(data);
                  } catch (err) {
                           setError('Failed to fetch problems');
                           console.error(err);
                  } finally {
                           setLoading(false);
                  }
         };

         const handleDelete = async (id) => {
                  if (!window.confirm('Are you sure you want to delete this problem?')) return;
                  try {
                           await axiosClient.delete(`/problem/delete/${id}`);
                           setProblems(problems.filter(problem => problem._id !== id));
                  } catch (err) {
                           alert('Failed to delete problem');
                           console.error(err);
                  }
         };

         const getDifficultyColor = (difficulty) => {
                  const diff = difficulty?.toLowerCase();
                  if (diff === 'easy') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
                  if (diff === 'medium') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
                  if (diff === 'hard') return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
                  return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
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
                                                      <h1 className="text-3xl font-bold text-white">All Problems</h1>
                                                      <p className="text-slate-400">Manage and review all coding challenges.</p>
                                             </div>
                                             <div className="flex items-center gap-4 w-full md:w-auto">
                                                      <div className="relative w-full md:w-64">
                                                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                                               <input
                                                                        type="text"
                                                                        placeholder="Search problems..."
                                                                        className="input input-bordered bg-slate-900 border-slate-700 pl-10 w-full focus:border-indigo-500"
                                                                        value={searchTerm}
                                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                               />
                                                      </div>
                                                      <NavLink to="/admin/create" className="btn btn-primary gap-2">
                                                               <span className="text-lg">+</span> Create New
                                                      </NavLink>
                                             </div>
                                    </div>

                                    {/* Table */}
                                    <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                                             <table className="table w-full">
                                                      <thead className="bg-slate-950/50 border-b border-slate-800">
                                                               <tr>
                                                                        <th className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Title</th>
                                                                        <th className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Difficulty</th>
                                                                        <th className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4">Tags</th>
                                                                        <th className="font-bold text-slate-500 text-xs uppercase tracking-wider py-4 text-right">Actions</th>
                                                               </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-slate-800">
                                                               {filteredProblems.map((problem) => (
                                                                        <tr key={problem._id} className="hover:bg-slate-800/40 transition-colors">
                                                                                 <td className="py-4">
                                                                                          <div className="font-bold text-white text-base">{problem.title}</div>
                                                                                          <div className="text-xs text-slate-500 font-mono mt-1 opacity-60">{problem._id}</div>
                                                                                 </td>
                                                                                 <td>
                                                                                          <span className={`badge border ${getDifficultyColor(problem.difficulty)}`}>
                                                                                                   {problem.difficulty}
                                                                                          </span>
                                                                                 </td>
                                                                                 <td>
                                                                                          <div className="flex flex-wrap gap-1">
                                                                                                   {problem.tags.split(',').map((tag, i) => (
                                                                                                            <span key={i} className="badge badge-sm badge-ghost bg-slate-800 text-slate-400 border-slate-700">
                                                                                                                     {tag.trim()}
                                                                                                            </span>
                                                                                                   ))}
                                                                                          </div>
                                                                                 </td>
                                                                                 <td className="text-right">
                                                                                          <div className="flex justify-end gap-2">
                                                                                                   <NavLink to={`/problem/${problem._id}`} className="btn btn-sm btn-ghost btn-square text-slate-400 hover:text-white" title="View Problem">
                                                                                                            <Eye size={18} />
                                                                                                   </NavLink>
                                                                                                   <button className="btn btn-sm btn-ghost btn-square text-indigo-400 hover:text-indigo-300" title="Edit Problem (Coming Soon)">
                                                                                                            <Edit size={18} />
                                                                                                   </button>
                                                                                                   <button
                                                                                                            onClick={() => handleDelete(problem._id)}
                                                                                                            className="btn btn-sm btn-ghost btn-square text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                                                                                                            title="Delete Problem"
                                                                                                   >
                                                                                                            <Trash2 size={18} />
                                                                                                   </button>
                                                                                          </div>
                                                                                 </td>
                                                                        </tr>
                                                               ))}
                                                               {filteredProblems.length === 0 && (
                                                                        <tr>
                                                                                 <td colSpan="4" className="text-center py-12 text-slate-500">
                                                                                          No problems found matching your search.
                                                                                 </td>
                                                                        </tr>
                                                               )}
                                                      </tbody>
                                             </table>
                                    </div>
                           </div>
                  </div>
         );
};

export default AdminProblems;
