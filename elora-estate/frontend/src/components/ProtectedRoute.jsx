import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps any route that requires a logged-in session. `roles`, if given,
// further restricts to specific roles (e.g. reports pages: Admin only) —
// mirrors the server-side authorize() middleware so the UI never even
// offers a path the API would reject anyway.
export default function ProtectedRoute({ children, roles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-harbor">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ redirectTo: location.pathname }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
