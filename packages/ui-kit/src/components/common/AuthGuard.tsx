/**
 * Auth Guard Component
 * Simple wrapper that only checks for authentication
 */
import { type ReactNode, type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@superapp/core-logic';

export interface AuthGuardProps {
  /** Content to render when authenticated */
  children: ReactNode;
  /** Path to redirect to if not authenticated (default: /login) */
  redirectTo?: string;
  /** Custom loading component */
  loadingFallback?: ReactNode;
}

/**
 * Simple authentication guard - redirects to login if not authenticated
 */
export function AuthGuard({
  children,
  redirectTo = '/login',
  loadingFallback,
}: AuthGuardProps): ReactNode {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    if (loadingFallback) {
      return loadingFallback as ReactElement;
    }
    return null;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children as ReactElement;
}
