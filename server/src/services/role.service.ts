/**
 * Role Service
 * 
 * Handles CRUD operations for user roles.
 */
import { BaseService } from './base.service.js';
import { Collections, CacheKeys } from '../config/index.js';
import type { Role, RolePermissions } from '../types/index.js';

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * Service for managing user roles and their permissions
 */
class RoleService extends BaseService<Role> {
  protected readonly collectionName = Collections.ROLES;
  protected readonly cacheKey = CacheKeys.ROLES;

  protected mapRecord(record: Record<string, unknown>): Role {
    return {
      id: record['id'] as string,
      name: record['name'] as string,
      description: (record['description'] as string) || undefined,
      permissions: (record['permissions'] as RolePermissions | undefined) ?? {},
      isActive: record['isActive'] as boolean | undefined,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const roleService = new RoleService();
