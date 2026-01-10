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

  /** Exclude soft-deleted records by default */
  protected readonly defaultFilter = 'isDeleted = false';

  protected mapRecord(record: Record<string, unknown>): Role {
    return {
      id: record['id'] as string,
      name: record['name'] as string,
      description: (record['description'] as string) || undefined,
      permissions: (record['permissions'] as RolePermissions | undefined) ?? {},
      isActive: (record['isActive'] as boolean | undefined) ?? true,
      isDeleted: (record['isDeleted'] as boolean | undefined) ?? false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  /**
   * Update status for multiple roles
   */
  async updateStatusMany(ids: string[], isActive: boolean, userId?: string): Promise<void> {
    return super.updateMany(ids, { isActive }, userId);
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const roleService = new RoleService();
