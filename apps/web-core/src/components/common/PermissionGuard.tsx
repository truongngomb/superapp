/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */

import { type ReactNode, type ReactElement } from 'react';
import { useAuth } from '@/hooks';
import { PermissionAction, PermissionResource } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface PermissionGuardProps {
  /** Resource to check permission for */
  resource: PermissionResource | string;
  /** Action to check permission for */
  action: PermissionAction | string;
  /** Content to render when permission is granted */
  children: ReactNode;
  /** Content to render when permission is denied (default: null) */
  fallback?: ReactNode;
  /** Whether to require authentication (default: true) */
  requireAuth?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Guard component that checks user permissions
 * 
 * Supports guest users with Public role permissions.
 * If requireAuth is true but guest has the required permission, access is granted.
 * 
 * @example
 * ```tsx
 * <PermissionGuard resource="categories" action="create">
 *   <CreateButton />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  resource,
  action,
  children,
  fallback = null,
  requireAuth = true,
}: PermissionGuardProps): ReactElement | null {
  const { checkPermission, isAuthenticated, isLoading } = useAuth();

  // Don't render anything while loading auth state
  if (isLoading) {
    return null;
  }

  // Check permission first (supports guest users with Public role permissions)
  const hasPermission = checkPermission(resource, action);

  if (hasPermission) {
    // Permission granted - show content (even for guest users)
    return children as ReactElement;
  }

  // No permission - check if we need authentication
  if (requireAuth && !isAuthenticated) {
    // Not authenticated and no permission from Public role
    return fallback as ReactElement | null;
  }

  // Authenticated but no permission
  return fallback as ReactElement | null;
}


