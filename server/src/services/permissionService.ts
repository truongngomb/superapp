import { Collections, pb, checkPocketBaseHealth } from '../config/index.js';
import type { RolePermissions } from '../types/index.js';
import { logger } from '../utils/index.js';

/**
 * Service for handling permission logic, specifically fetching
 * permissions for users based on their assigned roles.
 */
export class PermissionService {
  /**
   * Get permissions for a specific user based on their role.
   * Fetches the user from PocketBase and expands the 'role' relation.
   * 
   * @param userId The ID of the user to fetch permissions for
   * @returns A RolePermissions object containing resource-action mappings
   */
  async getUserPermissions(userId: string): Promise<RolePermissions> {
    const pbAvailable = await checkPocketBaseHealth();
    
    if (pbAvailable) {
      try {
        // Fetch User with expanded 'role'
        const user = await pb.collection(Collections.USERS).getOne(userId, {
          expand: 'role',
          requestKey: null,
        });
        
        const role = user.expand?.['role'] as Record<string, unknown> | undefined;
        
        if (process.env.NODE_ENV !== 'production') {
          logger.debug('PermissionService', `Fetched role for user ${userId}`, role);
        }

        if (role && role['permissions']) {
          let perms = role['permissions'];
          
          // Handle potential string serialization from PocketBase (e.g. if field type is text)
          if (typeof perms === 'string') {
            try {
              perms = JSON.parse(perms);
            } catch (error) {
              logger.error('PermissionService', 'Failed to parse permissions JSON', error);
              return {};
            }
          }

          return perms as RolePermissions;
        }
      } catch (error) {
        logger.error('PermissionService', `Fetch permissions error for user ${userId}:`, error);
      }
    }
    
    return {};
  }
}

export const permissionService = new PermissionService();
export const getUserPermissions = permissionService.getUserPermissions.bind(permissionService);
