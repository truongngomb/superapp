/**
 * Protected Route Component
 * Wraps routes that require authentication and/or specific permissions
 */

import {
  type ReactNode,
  type ReactElement,
} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { LoadingSpinner } from './LoadingSpinner';

// ============================================================================
// Types
// ============================================================================

interface ProtectedRouteProps {
  /** Content to render when access is granted */
  children: ReactNode;
  /** Resource to check permission for (optional) */
  resource?: string;
  /** Action to check permission for (optional) */
  action?: string;
  /** Path to redirect to if not authenticated (default: /login) */
  redirectTo?: string;
  /** Custom loading component (optional) */
  loadingFallback?: ReactNode;
  /** Custom forbidden component (optional) */
  forbiddenFallback?: ReactNode;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Route protection guard that checks authentication and permissions
 * 
 * @example
 * ```tsx
 * // Require authentication only
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 * 
 * // Require specific permission
 * <Route path="/admin/roles" element={
 *   <ProtectedRoute resource="roles" action="view">
 *     <RolesPage />
 *   </ProtectedRoute>
 * } />
 * ```
 */
export function ProtectedRoute({
  children,
  resource,
  action,
  redirectTo = '/login',
  loadingFallback,
  forbiddenFallback,
}: ProtectedRouteProps): ReactElement {
  const { isAuthenticated, isLoading, checkPermission } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    if (loadingFallback) {
      return loadingFallback as ReactElement;
    }
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check permission if resource and action are specified
  if (resource && action) {
    const hasPermission = checkPermission(resource, action);
    
    if (!hasPermission) {
      if (forbiddenFallback) {
        return forbiddenFallback as ReactElement;
      }
      return <ForbiddenPage />;
    }
  }

  // Access granted
  return children as ReactElement;
}

// ============================================================================
// Forbidden Page Component
// ============================================================================

/**
 * Default forbidden page component
 */
function ForbiddenPage(): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
      <p className="text-muted mb-6 max-w-md">
        You don't have permission to access this page. 
        Please contact your administrator if you believe this is an error.
      </p>
      <a
        href="/"
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Go to Home
      </a>
    </div>
  );
}
