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
import { LoadingSpinner } from '@superapp/ui-kit';
import { useTranslation } from 'react-i18next';

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
 * If resource/action is specified, checks permission FIRST.
 * This allows guest users with Public role permissions to access pages.
 * Only redirects to login if:
 * - No permission specified AND not authenticated, OR
 * - Permission specified but not granted AND not authenticated
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
 * // Require specific permission (guest users with Public role can access if permitted)
 * <Route path="/categories" element={
 *   <ProtectedRoute resource="categories" action="view">
 *     <CategoriesPage />
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
  const { t } = useTranslation(['common']);
  const { isAuthenticated, isLoading, checkPermission } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    if (loadingFallback) {
      return loadingFallback as ReactElement;
    }
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text={t('common:auth.checking')} />
      </div>
    );
  }

  // Check permission first (supports guest users with Public role permissions)
  if (resource && action) {
    const hasPermission = checkPermission(resource, action);
    
    if (hasPermission) {
      // Permission granted - allow access (even for guest users)
      return children as ReactElement;
    }
    
    // No permission - redirect to login if not authenticated
    if (!isAuthenticated) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    
    // Authenticated but no permission - show forbidden
    if (forbiddenFallback) {
      return forbiddenFallback as ReactElement;
    }
    return <ForbiddenPage />;
  }

  // No permission check required - require authentication
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
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
  const { t } = useTranslation(['common']);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <div className="text-6xl mb-4">🚫</div>
      <h1 className="text-3xl font-bold text-foreground mb-2">{t('common:auth.access_denied')}</h1>
      <p className="text-muted mb-6 max-w-md">
        {t('common:auth.access_denied_desc')}
      </p>
      <a
        href="/"
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        {t('common:actions.go_home')}
      </a>
    </div>
  );
}
