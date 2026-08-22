import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Heart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Building2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children, activeTab = 'overview' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'My Visits', path: '/dashboard/visits', icon: Calendar },
    { name: 'Shortlisted Properties', path: '/dashboard/shortlist', icon: Heart },
    { name: 'Account & Preferences', path: '/dashboard/profile', icon: User },
  ];

  const handleLogout = async () => {
    if (logout) await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Mobile Top App Bar */}
      <div className="md:hidden bg-slate-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-amber-500/20 sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-amber-500/20 text-amber-400 font-serif text-base font-bold flex items-center justify-center">
            E
          </div>
          <span className="font-serif text-lg font-bold tracking-tight">EloraEstate</span>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:text-white"
          aria-label="Toggle Dashboard Menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-950 text-slate-300 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1">
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-sm bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-serif text-lg font-bold">
                E
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Elora<span className="text-amber-500 font-normal">Estate</span>
              </span>
            </Link>
          </div>

          {/* User Profile Identifier */}
          <div className="px-6 py-4 bg-slate-900/50 border-b border-slate-800">
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400/80 font-semibold mb-0.5">
              Client Portal
            </div>
            <div className="text-sm font-semibold text-white truncate">
              {user?.name || user?.email || 'Tenant User'}
            </div>
            <div className="text-[11px] font-mono text-slate-400 truncate">
              {user?.phone || user?.email}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-mono font-medium transition-all ${
                      isActive
                        ? 'bg-amber-600/15 text-amber-300 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-amber-500" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-40" />
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/properties"
            className="flex items-center justify-between w-full px-3 py-2 rounded text-xs font-mono text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Browse Listings</span>
            </div>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded text-xs font-mono text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
        {children}
      </main>
    </div>
  );
}