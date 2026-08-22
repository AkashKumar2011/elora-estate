import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const NAV_BY_ROLE = {
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/properties/manage', label: 'Properties' },
    { to: '/clients', label: 'Clients' },
    { to: '/leads', label: 'Leads' },
    { to: '/follow-ups', label: 'Follow-ups' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/locations', label: 'Locations' },
    { to: '/admin/reports', label: 'Reports' },
  ],
  broker: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/properties/manage', label: 'Properties' },
    { to: '/clients', label: 'Clients' },
    { to: '/leads', label: 'Leads' },
    { to: '/follow-ups', label: 'Follow-ups' },
  ],
  owner_caretaker: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/properties/manage', label: 'My Properties' },
  ],
  client: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/properties', label: 'Browse Properties' },
  ],
};

export default function AppLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = NAV_BY_ROLE[user.role] || [];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-56 shrink-0 bg-basalt text-chalk flex md:flex-col">
        <div className="px-5 py-5 hidden md:block">
          <Link to="/" className="font-display text-lg font-semibold">
            Elora<span className="text-laterite">Estate</span>
          </Link>
          <p className="text-harbor-200 text-xs mt-1 capitalize">{user.role.replace('_', ' ')}</p>
        </div>
        <nav className="flex md:flex-col flex-1 overflow-x-auto md:overflow-visible">
          {links.map((link) => {
            const active = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-5 py-3 text-sm whitespace-nowrap border-l-2 transition-colors ${
                  active ? 'border-laterite bg-basalt-700 text-chalk' : 'border-transparent text-harbor-200 hover:text-chalk'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 hidden md:block">
          <Button size="sm" variant="ghost" className="!text-harbor-200 hover:!bg-basalt-700 hover:!text-chalk w-full" onClick={signOut}>
            Log out
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden border-b border-harbor-200 bg-chalk px-4 h-14 flex items-center justify-between">
          <span className="font-display font-semibold">EloraEstate</span>
          <Button size="sm" variant="ghost" onClick={() => { signOut(); navigate('/'); }}>
            Log out
          </Button>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
