/**
 * Auth Guard Component
 * Simple wrapper that only checks for authentication
 * Use ProtectedRoute for permission-based access control
 */

import { type ReactNode, type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';

// ============================================================================
// Types
// ============================================================================

interface AuthGuardProps {
  /** Content to render when authenticated */
  children: ReactNode;
  /** Path to redirect to if not authenticated (default: /login) */
  redirectTo?: string;
  /** Custom loading component */
  loadingFallback?: ReactNode;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Simple authentication guard - redirects to login if not authenticated
 * 
 * @example
 * ```tsx
 * <Route path="/profile" element={
 *   <AuthGuard>
 *     <ProfilePage />
 *   </AuthGuard>
 * } />
 * ```
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
