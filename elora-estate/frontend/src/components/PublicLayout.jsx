import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/eloraestate-logo.png';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Properties', path: '/properties' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

function LogoMark({ dark = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="EloraEstate home">
      <img src={logo} alt="EloraEstate" className="h-9 w-9 rounded-sm object-contain" />
      <span className={`font-display text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-stone-950'}`}>
        EloraEstate
      </span>
    </Link>
  );
}

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'admin'
    ? '/admin/users'
    : user?.role === 'broker'
      ? '/dashboard'
      : user?.role === 'owner_caretaker'
        ? '/dashboard'
        : '/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EC] text-[#17120F] font-sans antialiased selection:bg-[#C9642A]/20 selection:text-[#7A2B12]">
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-[#FDFBF7]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <LogoMark />

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `relative py-2 text-sm font-medium transition-colors ${
                    isActive ? 'text-[#C55F26]' : 'text-stone-700 hover:text-stone-950'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex">
            {user ? (
              <button
                type="button"
                onClick={() => navigate(dashboardPath)}
                className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C55F26]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-md bg-[#C55F26] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#A94719]"
              >
                <User className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 bg-white text-stone-900 md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-public-menu"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-public-menu" className="border-t border-stone-200 bg-[#FDFBF7] px-4 py-4 shadow-xl md:hidden">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-3 text-sm font-semibold ${isActive ? 'bg-[#F2E8DB] text-[#C55F26]' : 'text-stone-800 hover:bg-white'}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <Link
                to={user ? dashboardPath : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="mt-3 flex items-center justify-center rounded-md bg-[#C55F26] px-4 py-3 text-sm font-semibold text-white"
              >
                {user ? 'Dashboard' : 'Login'}
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="bg-[#0E1728] text-stone-300">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="space-y-4">
            <LogoMark dark />
            <p className="max-w-xs text-sm leading-6 text-stone-400">
              Mumbai residential rentals and flats for sale, organized around a clearer property search journey.
            </p>
            <p className="text-xs uppercase tracking-[0.24em] text-[#D8A95A]">Mumbai, Maharashtra</p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white">Explore</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li><Link to="/properties" className="hover:text-white">Properties</Link></li>
              <li><Link to="/properties?purpose=rent" className="hover:text-white">Rent</Link></li>
              <li><Link to="/properties?purpose=buy" className="hover:text-white">Buy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white">Company</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/feedback" className="hover:text-white">Feedback</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-white">Account</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li><Link to="/login?mode=user" className="hover:text-white">User Login</Link></li>
              <li><Link to="/login?mode=agent" className="hover:text-white">Agent Login</Link></li>
              <li><Link to="/login?mode=agent" className="hover:text-white">Owner/Caretaker Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-xs text-stone-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <span>© EloraEstate. All rights reserved.</span>
            <span>Public property details only. Private owner data is protected.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
