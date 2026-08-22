import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Building2, 
  Phone, 
  Compass, 
  User, 
  LayoutDashboard, 
  ArrowRight,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Discover', path: '/properties', icon: Compass },
    { name: 'About', path: '/about', icon: Building2 },
    { name: 'Contact', path: '/contact', icon: Phone },
    { name: 'Feedback', path: '/feedback', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9] text-[#12171A] font-sans antialiased selection:bg-[#B34728]/15 selection:text-[#94381C]">
      {/* Top Advisory Bar */}
      <div className="bg-[#12171A] text-[#E4E3DD] text-[11px] font-mono py-1.5 px-4 sm:px-6 border-b border-[#2A3138] flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] animate-pulse"></span>
            Curated Mumbai Residential Rentals & Direct Broker Coordination
          </span>
          <div className="hidden sm:flex items-center gap-4 text-[#A6A49C]">
            <a href="tel:+919820000000" className="hover:text-white transition-colors">Direct Desk: +91 (Mumbai)</a>
            <span>•</span>
            <Link to="/login" className="hover:text-amber-400 transition-colors">Owner / Agent Portal</Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E4E3DD] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-sm bg-[#12171A] border border-[#B8860B]/40 flex items-center justify-center text-[#B8860B] font-serif text-xl font-bold shadow-sm transition-transform group-hover:scale-95">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#12171A] leading-none">
                Elora<span className="text-[#B34728] font-normal italic">Estate</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#7A7870] mt-1">
                Mumbai Advisory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium transition-all py-1.5 relative ${
                    isActive
                      ? 'text-[#12171A] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#B34728]'
                      : 'text-[#5C5A52] hover:text-[#12171A]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/properties"
              className="px-4 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#12171A] hover:text-[#B34728] transition-colors"
            >
              Explore Homes
            </Link>
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'broker' ? '/broker' : user.role === 'owner' ? '/owner' : '/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider rounded-sm bg-[#12171A] text-[#B8860B] hover:bg-[#1C2227] border border-[#B8860B]/30 transition-all shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider rounded-sm bg-[#12171A] text-white hover:bg-[#B34728] transition-all shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Client Access</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-sm text-[#12171A] hover:bg-[#F3F2EE] focus:outline-none focus:ring-2 focus:ring-[#B34728]"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-[113px] bg-[#FFFFFF] border-b border-[#E4E3DD] shadow-2xl px-6 pt-4 pb-8 flex flex-col gap-3 z-50 animate-fadeIn">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3.5 rounded-sm text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-[#F3F2EE] text-[#B34728] font-semibold border-l-2 border-[#B34728]' 
                        : 'text-[#3B3A36] hover:bg-[#FBFBF9]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#B8860B]" />
                    <span>{link.name}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              );
            })}
            <div className="pt-4 border-t border-[#E4E3DD] mt-2 space-y-2">
              <Link
                to="/properties"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-[#B34728] text-white font-mono text-xs uppercase tracking-wider font-semibold shadow-sm"
              >
                Browse All Properties
              </Link>
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-[#12171A] text-[#B8860B] font-mono text-xs uppercase tracking-wider font-semibold"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Account Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-sm bg-[#12171A] text-white font-mono text-xs uppercase tracking-wider font-semibold"
                >
                  <User className="w-4 h-4 text-[#B8860B]" />
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Body */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#12171A] text-[#A6A49C] text-sm border-t border-[#2A3138]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-[#B8860B]/10 border border-[#B8860B]/30 text-[#B8860B] font-serif font-bold flex items-center justify-center text-base">
                E
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                Elora<span className="text-[#B34728] font-normal italic">Estate</span>
              </span>
            </div>
            <p className="text-xs text-[#8A8880] leading-relaxed">
              Curated residential rental advisory operating across South Mumbai and prime micro-markets. Dedicated visit coordination and transparent broker linkages.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#B8860B]">
              Mumbai, Maharashtra, India
            </div>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-white mb-4 font-semibold">
              Explore Mumbai
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/properties?location=Worli" className="hover:text-[#B8860B] transition-colors">Worli Residences</Link></li>
              <li><Link to="/properties?location=Lower+Parel" className="hover:text-[#B8860B] transition-colors">Lower Parel High-Rises</Link></li>
              <li><Link to="/properties?location=Prabhadevi" className="hover:text-[#B8860B] transition-colors">Prabhadevi Towers</Link></li>
              <li><Link to="/properties?location=Colaba" className="hover:text-[#B8860B] transition-colors">Colaba & Heritage Belt</Link></li>
              <li><Link to="/properties?location=Bandra" className="hover:text-[#B8860B] transition-colors">Bandra West Living</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-white mb-4 font-semibold">
              Platform & Process
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/properties" className="hover:text-[#B8860B] transition-colors">All Rental Listings</Link></li>
              <li><Link to="/about" className="hover:text-[#B8860B] transition-colors">About Our Platform</Link></li>
              <li><Link to="/contact" className="hover:text-[#B8860B] transition-colors">Direct Desk & Coordination</Link></li>
              <li><Link to="/feedback" className="hover:text-[#B8860B] transition-colors">Submit Experience Feedback</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-white mb-4 font-semibold">
              Client & Owner Desk
            </h4>
            <p className="text-xs text-[#8A8880] leading-relaxed mb-3">
              Are you a property owner or authorized broker managing prime Mumbai inventory?
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#B8860B] hover:text-white transition-colors"
            >
              <span>Access Owner / Broker Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="border-t border-[#1C2227] py-6 text-center text-xs font-mono text-[#5C5A52]">
          © {new Date().getFullYear()} EloraEstate. Curated Mumbai Property Discovery. All rights reserved.
        </div>
      </footer>
    </div>
  );
}