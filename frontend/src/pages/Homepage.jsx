import { useEffect, useState } from 'react';
import { NavLink } from 'react-router'; // Fixed import
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

function Homepage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) {
        console.error('Error fetching solved problems:', error);
      }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]); // Clear solved problems on logout
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                      solvedProblems.some(sp => sp._id === problem._id);
    const searchMatch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    return difficultyMatch && tagMatch && statusMatch && searchMatch;
  });

  // Statistics Calculation
  const solvedIds = new Set(solvedProblems.map(sp => sp._id));
  const totalSolved = solvedProblems.length;
  const totalProblems = problems.length;
  const solvePercentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;
  
  const easyTotal = problems.filter(p => p.difficulty === 'easy').length;
  const mediumTotal = problems.filter(p => p.difficulty === 'medium').length;
  const hardTotal = problems.filter(p => p.difficulty === 'hard').length;

  const easySolved = problems.filter(p => p.difficulty === 'easy' && solvedIds.has(p._id)).length;
  const mediumSolved = problems.filter(p => p.difficulty === 'medium' && solvedIds.has(p._id)).length;
  const hardSolved = problems.filter(p => p.difficulty === 'hard' && solvedIds.has(p._id)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 font-sans selection:bg-primary selection:text-primary-content">
      {/* Navigation Bar */}
      <nav className="navbar bg-base-100/90 backdrop-blur-md shadow-sm px-6 sticky top-0 z-50 border-b border-base-300">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost text-2xl font-black tracking-tighter text-primary">
            <span className="text-base-content">Leet</span>Code
          </NavLink>
        </div>
        <div className="flex-none gap-4">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder ring ring-primary ring-offset-base-100 ring-offset-2">
               <div className="bg-neutral text-neutral-content rounded-full w-10">
                  <span className="text-xl font-bold">{user?.firstName?.charAt(0).toUpperCase()}</span>
               </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200">
              <li className="menu-title px-4 py-2 text-lg text-base-content">Hi, {user?.firstName}</li>
              <div className="divider my-0"></div>
              <li><button onClick={handleLogout} className="text-error font-medium">Logout</button></li>
              {user?.role === 'admin' && <li><NavLink to="/admin">Admin Dashboard</NavLink></li>}
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-6 max-w-7xl">
        
        {/* Hero / Stats Section */}
        {user && (
          <div className="mb-10 animate-fade-in-down">
            <h1 className="text-3xl font-bold mb-6 text-base-content">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Main Progress Card */}
              <div className="card bg-base-100 shadow-xl border border-base-200">
                <div className="card-body flex flex-row items-center justify-between">
                  <div>
                    <h2 className="card-title text-base-content/70">Total Solved</h2>
                    <p className="text-3xl font-extrabold mt-2">{totalSolved} <span className="text-lg font-normal text-base-content/50">/ {totalProblems}</span></p>
                  </div>
                  <div className="radial-progress text-primary font-bold text-sm" style={{"--value": solvePercentage, "--size": "4rem", "--thickness": "4px"}} role="progressbar">
                    {solvePercentage}%
                  </div>
                </div>
              </div>

              {/* Easy Stats */}
              <div className="card bg-base-100 shadow-lg border-l-4 border-success">
                <div className="card-body p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-success">Easy</h3>
                    <span className="badge badge-success badge-outline">{easySolved} / {easyTotal}</span>
                  </div>
                  <progress className="progress progress-success w-full h-2" value={easySolved} max={easyTotal || 1}></progress>
                </div>
              </div>

              {/* Medium Stats */}
              <div className="card bg-base-100 shadow-lg border-l-4 border-warning">
                <div className="card-body p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-warning">Medium</h3>
                    <span className="badge badge-warning badge-outline">{mediumSolved} / {mediumTotal}</span>
                  </div>
                  <progress className="progress progress-warning w-full h-2" value={mediumSolved} max={mediumTotal || 1}></progress>
                </div>
              </div>

              {/* Hard Stats */}
              <div className="card bg-base-100 shadow-lg border-l-4 border-error">
                <div className="card-body p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-error">Hard</h3>
                    <span className="badge badge-error badge-outline">{hardSolved} / {hardTotal}</span>
                  </div>
                  <progress className="progress progress-error w-full h-2" value={hardSolved} max={hardTotal || 1}></progress>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 bg-base-100 p-4 rounded-2xl shadow-lg border border-base-200 sticky top-20 z-40">
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-base-content/50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search problems..." 
              className="input input-bordered w-full pl-10 focus:outline-none focus:border-primary"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto z-50">
                {problems.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                  problems
                    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 5)
                    .map(problem => (
                      <NavLink 
                        key={problem._id} 
                        to={`/problem/${problem._id}`}
                        className="block px-4 py-3 hover:bg-base-200 transition-colors border-b border-base-100 last:border-none group"
                        onClick={() => setShowSuggestions(false)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-base-content group-hover:text-primary transition-colors">
                            {problem.title}
                          </span>
                          <span className={`badge badge-xs ${getDifficultyBadgeColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                      </NavLink>
                    ))
                ) : (
                  <div className="p-4 text-center text-base-content/50 text-sm">
                    No problems found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 w-full lg:w-auto justify-end">
            <select 
              className="select select-bordered w-full sm:w-auto focus:outline-none focus:border-primary"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">Status: All</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
            </select>

            <select 
              className="select select-bordered w-full sm:w-auto focus:outline-none focus:border-primary"
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              <option value="all">Difficulty: All</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select 
              className="select select-bordered w-full sm:w-auto focus:outline-none focus:border-primary"
              value={filters.tag}
              onChange={(e) => setFilters({...filters, tag: e.target.value})}
            >
              <option value="all">Tags: All</option>
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
            </select>
          </div>
        </div>

        {/* Problems Table */}
        <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-lg w-full">
              <thead className="bg-base-200/50 text-base-content/70 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="w-16 text-center">Status</th>
                  <th>Title</th>
                  <th className="w-32">Difficulty</th>
                  <th className="w-40">Tag</th>
                  <th className="w-32 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-base">
                {filteredProblems.length > 0 ? (
                  filteredProblems.map((problem, index) => {
                    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                    return (
                      <tr key={problem._id} className="hover:bg-base-200/40 transition-colors duration-200 border-b border-base-100 last:border-none">
                        <td className="text-center">
                          {isSolved ? (
                            <div className="tooltip tooltip-right" data-tip="Solved">
                              <div className="bg-success/10 p-1.5 rounded-full inline-block">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div className="tooltip tooltip-right" data-tip="Unsolved">
                               <div className="w-2.5 h-2.5 rounded-full bg-base-300 mx-auto"></div>
                            </div>
                          )}
                        </td>
                        <td>
                          <NavLink to={`/problem/${problem._id}`} className="font-semibold hover:text-primary transition-colors text-lg">
                            {index + 1}. {problem.title}
                          </NavLink>
                        </td>
                        <td>
                          <span className={`badge ${getDifficultyBadgeColor(problem.difficulty)} badge-md border-0 font-bold`}>
                            {problem.difficulty}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <span className="badge badge-ghost badge-sm text-xs opacity-70">
                              {problem.tags}
                            </span>
                          </div>
                        </td>
                        <td className="text-right">
                          <NavLink to={`/problem/${problem._id}`} className="btn btn-sm btn-outline btn-primary hover:!text-white">
                            Solve
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </NavLink>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-16 text-base-content/60">
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-base-200 p-4 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-medium">No problems found</p>
                          <p className="text-sm opacity-70">Try adjusting your search or filters</p>
                        </div>
                        <button className="btn btn-ghost btn-sm text-primary" onClick={() => {setFilters({difficulty: 'all', tag: 'all', status: 'all'}); setSearchQuery('');}}>
                          Reset Filters
                        </button>
                      </div>
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
}

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'bg-success/15 text-success';
    case 'medium': return 'bg-warning/15 text-warning';
    case 'hard': return 'bg-error/15 text-error';
    default: return 'badge-neutral';
  }
};

export default Homepage;