import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { LoadingState } from '../ui/States';

interface ProtectedRouteProps { children: ReactNode; permission?: string }

export function ProtectedRoute({ children, permission }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState message="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (permission && !hasPermission(user.permissions, permission)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
