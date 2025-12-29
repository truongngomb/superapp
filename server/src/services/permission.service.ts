/**
 * Permission Service
 * 
 * Handles fetching user permissions based on their roles.
 */
import { Collections, pb, checkPocketBaseHealth, config } from '../config/index.js';
import type { RolePermissions } from '../types/index.js';
import { createLogger } from '../utils/index.js';

// =============================================================================
// Service Implementation
// =============================================================================

const log = createLogger('PermissionService');

/**
 * Service for fetching user permissions based on their assigned roles
 */
class PermissionService {
  /**
   * Get permissions for a specific user based on their role
   * 
   * Fetches the user from PocketBase and expands the 'role' relation
   * to get the permissions object.
   * 
   * @param userId - The ID of the user to fetch permissions for
   * @returns A RolePermissions object containing resource-action mappings
   */
  async getUserPermissions(userId: string): Promise<RolePermissions> {
    const pbAvailable = await checkPocketBaseHealth();

    if (!pbAvailable) {
      log.warn('Database unavailable, returning empty permissions');
      return {};
    }

    try {
      // Fetch User with expanded 'role' relation
      const user = await pb.collection(Collections.USERS).getOne(userId, {
        expand: 'role',
        requestKey: null,
      });

      const role = user.expand?.['role'] as Record<string, unknown> | undefined;

      if (config.isDevelopment) {
        log.debug(`Fetched role for user ${userId}`, role);
      }

      if (!role?.['permissions']) {
        return {};
      }

      let perms: unknown = role['permissions'];

      // Handle potential string serialization from PocketBase
      if (typeof perms === 'string') {
        try {
          perms = JSON.parse(perms) as unknown;
        } catch {
          log.error('Failed to parse permissions JSON');
          return {};
        }
      }

      return perms as RolePermissions;
    } catch (error) {
      log.error(`Failed to fetch permissions for user ${userId}`, error);
      return {};
    }
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const permissionService = new PermissionService();

/** @deprecated Use permissionService.getUserPermissions instead */
export const getUserPermissions = permissionService.getUserPermissions.bind(permissionService);
