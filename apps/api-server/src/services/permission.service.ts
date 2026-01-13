/**
 * Permission Service
 * 
 * Handles fetching user permissions based on their roles.
 * Supports multiple roles per user with permission merging (union).
 */
import { Collections, adminPb, checkPocketBaseHealth, config, cache, ensureAdminAuth } from '../config/index.js';
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
      // Ensure adminPb is authenticated before querying
      await ensureAdminAuth();
      
      // Fetch User with expanded 'roles' relation (multiple)
      const user = await adminPb.collection(Collections.USERS).getOne(userId, {
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
  /**
   * Get permissions for the Public role (for guest users)
   * 
   * Fetches the "Public" role from database and returns its permissions.
   * Results are cached for 60 seconds to minimize database queries.
   * 
   * @returns RolePermissions for the Public role, or empty object if not found
   */
  async getPublicRolePermissions(): Promise<RolePermissions> {
    const cacheKey = 'public_role_permissions';
    const cached = cache.get<RolePermissions>(cacheKey);
    if (cached) return cached;

    const pbAvailable = await checkPocketBaseHealth();
    if (!pbAvailable) {
      log.warn('Database unavailable, returning empty public permissions');
      return {};
    }

    try {
      // Ensure adminPb is authenticated before querying
      await ensureAdminAuth();
      
      const publicRole = await adminPb.collection(Collections.ROLES)
        .getFirstListItem('name = "Public" && isActive = true && isDeleted = false', {
          requestKey: null,
        });

      let permissions = publicRole['permissions'] as unknown;

      // Handle potential string serialization from PocketBase
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions) as unknown;
        } catch {
          log.error('Failed to parse Public role permissions JSON');
          return {};
        }
      }

      if (!permissions || typeof permissions !== 'object') {
        return {};
      }

      const rolePerms = permissions as RolePermissions;

      // Cache for 60 seconds
      cache.set(cacheKey, rolePerms, 60);

      if (config.isDevelopment) {
        log.debug('Public role permissions:', rolePerms);
      }

      return rolePerms;
    } catch (error) {
      log.debug('Failed to fetch Public role permissions (role may not exist)', error);
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

/** Get permissions for the Public role (guest users) */
export const getPublicRolePermissions = permissionService.getPublicRolePermissions.bind(permissionService);
