import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider } from './lib/toast';
import { ProtectedRoute } from './components/guards/ProtectedRoute';
import { AppLayout } from './components/layouts/AppLayout';
import { LoadingState } from './components/ui/States';
import { PERMISSIONS } from './lib/permissions';

const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const UnauthorizedPage = lazy(() => import('./pages/auth/ErrorPages').then(m => ({ default: m.UnauthorizedPage })));
const NotFoundPage = lazy(() => import('./pages/auth/ErrorPages').then(m => ({ default: m.NotFoundPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const DistrictListPage = lazy(() => import('./pages/districts/DistrictListPage').then(m => ({ default: m.DistrictListPage })));
const DistrictFormPage = lazy(() => import('./pages/districts/DistrictFormPage').then(m => ({ default: m.DistrictFormPage })));
const OrganizationListPage = lazy(() => import('./pages/organizations/OrganizationListPage').then(m => ({ default: m.OrganizationListPage })));
const OrganizationFormPage = lazy(() => import('./pages/organizations/OrganizationFormPage').then(m => ({ default: m.OrganizationFormPage })));
const UserListPage = lazy(() => import('./pages/users/UserListPage').then(m => ({ default: m.UserListPage })));
const UserDetailPage = lazy(() => import('./pages/users/UserDetailPage').then(m => ({ default: m.UserDetailPage })));
const UserFormPage = lazy(() => import('./pages/users/UserFormPage').then(m => ({ default: m.UserFormPage })));
const RoleListPage = lazy(() => import('./pages/roles/RoleListPage').then(m => ({ default: m.RoleListPage })));
const AuditListPage = lazy(() => import('./pages/audit/AuditListPage').then(m => ({ default: m.AuditListPage })));

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState message="Loading..." />;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<ProtectedRoute permission={PERMISSIONS.DASHBOARD_VIEW}><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute permission={PERMISSIONS.USERS_VIEW}><AppLayout><UserListPage /></AppLayout></ProtectedRoute>} />
        <Route path="/users/new" element={<ProtectedRoute permission={PERMISSIONS.USERS_CREATE}><AppLayout><UserFormPage /></AppLayout></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute permission={PERMISSIONS.USERS_VIEW}><AppLayout><UserDetailPage /></AppLayout></ProtectedRoute>} />
        <Route path="/users/:id/edit" element={<ProtectedRoute permission={PERMISSIONS.USERS_EDIT}><AppLayout><UserFormPage /></AppLayout></ProtectedRoute>} />
        <Route path="/districts" element={<ProtectedRoute permission={PERMISSIONS.DISTRICTS_VIEW}><AppLayout><DistrictListPage /></AppLayout></ProtectedRoute>} />
        <Route path="/districts/new" element={<ProtectedRoute permission={PERMISSIONS.DISTRICTS_CREATE}><AppLayout><DistrictFormPage /></AppLayout></ProtectedRoute>} />
        <Route path="/districts/:id/edit" element={<ProtectedRoute permission={PERMISSIONS.DISTRICTS_EDIT}><AppLayout><DistrictFormPage /></AppLayout></ProtectedRoute>} />
        <Route path="/organizations" element={<ProtectedRoute permission={PERMISSIONS.ORGANIZATIONS_VIEW}><AppLayout><OrganizationListPage /></AppLayout></ProtectedRoute>} />
        <Route path="/organizations/new" element={<ProtectedRoute permission={PERMISSIONS.ORGANIZATIONS_CREATE}><AppLayout><OrganizationFormPage /></AppLayout></ProtectedRoute>} />
        <Route path="/organizations/:id/edit" element={<ProtectedRoute permission={PERMISSIONS.ORGANIZATIONS_EDIT}><AppLayout><OrganizationFormPage /></AppLayout></ProtectedRoute>} />
        <Route path="/roles" element={<ProtectedRoute permission={PERMISSIONS.ROLES_VIEW}><AppLayout><RoleListPage /></AppLayout></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute permission={PERMISSIONS.AUDIT_VIEW}><AppLayout><AuditListPage /></AppLayout></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
