import { useEffect, useState } from 'react';
import axiosClient from '../utils/axiosClient'

const AdminDelete = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const { data } = await axiosClient.get('/problem/getAllProblem');
      setProblems(data);
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
      setError('Failed to delete problem');
      console.error(err);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-indigo-500"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-12 flex justify-center items-start">
        <div className="alert alert-error shadow-lg max-w-2xl bg-red-900/20 border-red-900 text-red-200">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'easy') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (diff === 'medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (diff === 'hard') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
              Manage Problems
            </h1>
            <p className="text-slate-400">View and manage existing coding challenges.</p>
          </div>
          <div className="badge badge-lg bg-indigo-500/10 text-indigo-400 border-indigo-500/20 gap-2">
            {problems.length} Total Problems
          </div>
        </header>

        <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-slate-950/50 border-b border-slate-800">
                <tr>
                  <th className="py-5 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">#</th>
                  <th className="py-5 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Title</th>
                  <th className="py-5 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Difficulty</th>
                  <th className="py-5 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</th>
                  <th className="py-5 px-6 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {problems.map((problem, index) => (
                  <tr key={problem._id} className="hover:bg-slate-800/30 transition-colors group">
                    <th className="py-4 px-6 font-mono text-slate-500 text-sm">{index + 1}</th>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-200 text-lg">{problem.title}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1 opacity-50 group-hover:opacity-100 transition-opacity">{problem._id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`badge border ${getDifficultyColor(problem.difficulty)} font-medium`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="badge badge-ghost bg-slate-800 text-slate-300 border-slate-700">
                        {problem.tags}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleDelete(problem._id)}
                        className="btn btn-sm btn-error btn-outline hover:bg-red-500 hover:text-white transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {problems.length === 0 && (
            <div className="text-center py-16">
              <div className="text-slate-600 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-400">No problems found</h3>
              <p className="text-slate-500 text-sm">Create a new problem to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDelete;