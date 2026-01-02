/**
 * Permission Service
 * 
 * Handles fetching user permissions based on their roles.
 * Supports multiple roles per user with permission merging (union).
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
   * Get permissions for a specific user based on their roles
   * 
   * Fetches the user from PocketBase and expands the 'roles' relation
   * to get the permissions objects. Merges permissions from all roles
   * using union (if any role grants a permission, user has it).
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
      // Fetch User with expanded 'roles' relation (multiple)
      const user = await pb.collection(Collections.USERS).getOne(userId, {
        expand: 'roles',
        requestKey: null,
      });

      const roles = user.expand?.['roles'] as Record<string, unknown>[] | undefined;

      if (config.isDevelopment) {
        log.debug(`Fetched ${String(roles?.length ?? 0)} roles for user ${userId}`);
      }

      if (!roles || roles.length === 0) {
        return {};
      }

      // Merge permissions from all roles (union)
      const mergedPermissions: RolePermissions = {};

      for (const role of roles) {
        let perms: unknown = role['permissions'];

        // Handle potential string serialization from PocketBase
        if (typeof perms === 'string') {
          try {
            perms = JSON.parse(perms) as unknown;
          } catch {
            log.error(`Failed to parse permissions JSON for role ${role['id'] as string}`);
            continue;
          }
        }

        if (!perms || typeof perms !== 'object') {
          continue;
        }

        const rolePerms = perms as RolePermissions;

        // Merge each resource's actions
        for (const [resource, actions] of Object.entries(rolePerms)) {
          if (!Array.isArray(actions)) {
            continue;
          }

          if (!mergedPermissions[resource]) {
            mergedPermissions[resource] = [];
          }

          // Union: add unique actions
          for (const action of actions) {
            if (!mergedPermissions[resource].includes(action)) {
              mergedPermissions[resource].push(action);
            }
          }
        }
      }

      if (config.isDevelopment) {
        log.debug(`Merged permissions for user ${userId}:`, mergedPermissions);
      }

      return mergedPermissions;
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
