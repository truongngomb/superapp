/**
 * Permission Hooks
 * Hooks for checking user permissions
 */

import { useAuth } from './useAuth';

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
