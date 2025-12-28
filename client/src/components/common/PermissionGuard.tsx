/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */

import { type ReactNode, type ReactElement } from 'react';
import { useAuth } from '@/context';
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

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return fallback as ReactElement | null;
  }

  // Check permission
  if (checkPermission(resource, action)) {
    return children as ReactElement;
  }

  return fallback as ReactElement | null;
}

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Hook to check a single permission
 */
export function usePermission(resource: string, action: string): boolean {
  const { checkPermission, isAuthenticated } = useAuth();
  return isAuthenticated && checkPermission(resource, action);
}

/**
 * Hook to check multiple permissions
 */
export function usePermissions(
  permissions: Array<{ resource: string; action: string }>
): boolean[] {
  const { checkPermission, isAuthenticated } = useAuth();
  
  return permissions.map(({ resource, action }) =>
    isAuthenticated && checkPermission(resource, action)
  );
}
