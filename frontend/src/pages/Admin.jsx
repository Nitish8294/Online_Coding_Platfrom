import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Video, ArrowLeft, LayoutDashboard, Users, Activity, FileCode } from 'lucide-react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axiosClient';

function Admin() {
  const [problemCount, setProblemCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblemCount(data.length);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform database.',
      icon: Plus,
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'hover:border-success',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems, test cases, and details.',
      icon: Edit,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'hover:border-warning',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Permanently remove problems from the platform.',
      icon: Trash2,
      color: 'text-error',
      bgColor: 'bg-error/10',
      borderColor: 'hover:border-error',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Manage Videos',
      description: 'Upload and manage video solutions for problems.',
      icon: Video,
      color: 'text-info',
      bgColor: 'bg-info/10',
      borderColor: 'hover:border-info',
      route: '/admin/video'
    },
    {
      id: 'users',
      title: 'Manage Users',
      description: 'View registered users and manage roles.',
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'hover:border-secondary',
      route: '/admin/users'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 font-sans">
      {/* Navbar */}
      <nav className="navbar bg-base-100/80 backdrop-blur-md shadow-sm px-6 sticky top-0 z-50 border-b border-base-300">
        <div className="flex-1">
          <NavLink to="/" className="btn btn-ghost gap-2 text-base-content/70 hover:text-primary transition-colors">
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Home</span>
          </NavLink>
        </div>
        <div className="flex-none">
           <div className="flex items-center gap-2 px-3 py-1 bg-base-200 rounded-full">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-sm font-medium opacity-70">Admin Mode</span>
           </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex p-4 bg-base-100 rounded-3xl shadow-lg mb-6 ring-1 ring-base-200">
             <LayoutDashboard size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-base-content mb-4 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-lg text-base-content/60 max-w-2xl mx-auto leading-relaxed">
            Manage your coding platform efficiently. Select an action below to proceed.
          </p>
        </div>

        {/* Quick Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12 max-w-2xl mx-auto">
          <div className="stat bg-base-100 shadow-md rounded-2xl border border-base-200">
            <div className="stat-figure text-primary">
              <FileCode size={32} />
            </div>
            <div className="stat-title">Total Problems</div>
            <div className="stat-value text-primary">{problemCount}</div>
            <div className="stat-desc">Available on platform</div>
          </div>
          
          <div className="stat bg-base-100 shadow-md rounded-2xl border border-base-200">
            <div className="stat-figure text-success">
              <Activity size={32} />
            </div>
            <div className="stat-title">System Status</div>
            <div className="stat-value text-success text-2xl">Operational</div>
            <div className="stat-desc">All systems normal</div>
          </div>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <NavLink
                key={option.id}
                to={option.route}
                className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group border border-base-200 ${option.borderColor}`}
              >
                <div className="card-body flex-row items-center gap-6 p-8">
                  {/* Icon */}
                  <div className={`p-4 rounded-2xl ${option.bgColor} ${option.color} group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent size={32} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-left">
                    <h2 className="card-title text-xl mb-1 group-hover:text-primary transition-colors">
                      {option.title}
                    </h2>
                    <p className="text-base-content/60 text-sm font-medium">
                      {option.description}
                    </p>
                  </div>
                  
                  {/* Arrow Icon */}
                  <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-base-content/30">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Admin;