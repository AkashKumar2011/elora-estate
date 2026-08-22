import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Building2, Info, Phone, MessageSquare, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Properties', path: '/properties', icon: Building2 },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-sm bg-slate-900 flex items-center justify-center text-amber-400 font-serif text-xl font-bold shadow-inner">
              E
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-slate-950 group-hover:text-amber-700 transition-colors">
              Elora<span className="text-amber-600 font-normal">Estate</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors py-1.5 border-b-2 ${
                    isActive
                      ? 'border-amber-600 text-slate-900 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Header Action Button */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'broker' ? '/broker' : user.role === 'owner' ? '/owner' : '/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded bg-slate-900 text-amber-400 hover:bg-slate-800 transition-all shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
              >
                <User className="w-4 h-4 text-amber-400" />
                <span>Client Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-20 bg-white border-b border-slate-200 shadow-xl px-4 pt-3 pb-6 flex flex-col gap-2 z-50 animate-fadeIn">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded text-base font-medium transition-colors ${
                      isActive ? 'bg-amber-50 text-amber-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 text-amber-600" />
                  {link.name}
                </NavLink>
              );
            })}
            <div className="pt-3 border-t border-slate-100 mt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded bg-slate-900 text-amber-400 font-medium"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded bg-slate-900 text-white font-medium"
                >
                  <User className="w-5 h-5 text-amber-400" />
                  Client Login
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-sm bg-amber-500/20 text-amber-400 font-serif font-bold flex items-center justify-center text-sm">
                E
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-white">EloraEstate</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Curated rental property discovery and direct broker visit coordination throughout Mumbai.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-white tracking-wide uppercase text-xs mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
              <li><Link to="/properties" className="hover:text-amber-400 transition-colors">Browse Listings</Link></li>
              <li><Link to="/about" className="hover:text-amber-400 transition-colors">About Our Platform</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white tracking-wide uppercase text-xs mb-3">Assistance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/contact" className="hover:text-amber-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/feedback" className="hover:text-amber-400 transition-colors">Submit Feedback</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-white tracking-wide uppercase text-xs mb-3">Direct Reach</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mumbai Regional Property Coordination. Visit scheduling available via direct broker channel.
            </p>
          </div>
        </div>
        <div className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} EloraEstate. All rights reserved.
        </div>
      </footer>
    </div>
  );
}