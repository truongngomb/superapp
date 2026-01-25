/**
 * Guest Guard Component
 * Only allows access to unauthenticated users
 * Useful for login/register pages
 */

import { type ReactNode, type ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { LoadingSpinner } from '@superapp/ui-kit';

// ============================================================================
// Types
// ============================================================================

interface GuestGuardProps {
  /** Content to render when NOT authenticated */
  children: ReactNode;
  /** Path to redirect to if already authenticated (default: /) */
  redirectTo?: string;
  /** Custom loading component */
  loadingFallback?: ReactNode;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Guest guard - redirects to home if already authenticated
 * 
 * @example
 * ```tsx
 * <Route path="/login" element={
 *   <GuestGuard>
 *     <LoginPage />
 *   </GuestGuard>
 * } />
 * ```
 */
export function GuestGuard({
  children,
  redirectTo = '/',
  loadingFallback,
}: GuestGuardProps): ReactElement {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Get the intended destination from location state
  const locationState = location.state as { from?: Location } | null;
  const from = locationState?.from?.pathname || redirectTo;

  // Show loading state
  if (isLoading) {
    if (loadingFallback) {
      return loadingFallback as ReactElement;
    }
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return children as ReactElement;
}
