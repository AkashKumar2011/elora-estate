import { Routes, Route } from 'react-router-dom';
import PublicLayout from './components/PublicLayout';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/public/HomePage';
import PropertiesPage from './pages/public/PropertiesPage';
import PropertyDetailPage from './pages/public/PropertyDetailPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import FeedbackPage from './pages/public/FeedbackPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/app/ClientsPage';
import ClientDetailPage from './pages/app/ClientDetailPage';
import LeadsPage from './pages/app/LeadsPage';
import FollowUpsPage from './pages/app/FollowUpsPage';
import PropertiesManagePage from './pages/app/PropertiesManagePage';
import PropertyFormPage from './pages/app/PropertyFormPage';
import AdminUsersPage from './pages/app/AdminUsersPage';
import AdminLocationsPage from './pages/app/AdminLocationsPage';
import AdminReportsPage from './pages/app/AdminReportsPage';

const STAFF_ROLES = ['admin', 'broker', 'owner_caretaker'];
const CRM_ROLES = ['admin', 'broker'];

export default function App() {
  return (
    <Routes>
      {/* ── Public site ──────────────────────────────────────────────── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>

      {/* Standalone — no site chrome, so the login flow stays focused */}
      <Route path="/login" element={<LoginPage />} />

      {/* ── Internal app (Admin / Broker / Owner-Caretaker / Client) ──── */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route
          path="/clients"
          element={
            <ProtectedRoute roles={CRM_ROLES}>
              <ClientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/:clientId"
          element={
            <ProtectedRoute roles={CRM_ROLES}>
              <ClientDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute roles={CRM_ROLES}>
              <LeadsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/follow-ups"
          element={
            <ProtectedRoute roles={CRM_ROLES}>
              <FollowUpsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/properties/manage"
          element={
            <ProtectedRoute roles={STAFF_ROLES}>
              <PropertiesManagePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/manage/new"
          element={
            <ProtectedRoute roles={STAFF_ROLES}>
              <PropertyFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/properties/manage/:id"
          element={
            <ProtectedRoute roles={STAFF_ROLES}>
              <PropertyFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/locations"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLocationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
