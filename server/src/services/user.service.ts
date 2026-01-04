/**
 * User Service
 * 
 * Handles CRUD operations for user management.
 */
import { BaseService, type ListOptions, type PaginatedResult } from './base.service.js';
import { Collections, CacheKeys, pb } from '../config/index.js';
import { NotFoundError, BadRequestError } from '../middleware/index.js';
import type { User, UserUpdateInput, UserRoleAssignment } from '../types/index.js';

// =============================================================================
// Types
// =============================================================================

/** User with expanded role names */
export type UserWithRoles = User & { roleNames?: string[] };

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * Service for managing users
 */
class UserService extends BaseService<User> {
  protected readonly collectionName = Collections.USERS;
  protected readonly cacheKey = CacheKeys.USERS;

  protected mapRecord(record: Record<string, unknown>): User {
    const avatarFileName = record['avatar'] as string | undefined;
    const avatarUrl = avatarFileName 
      ? pb.files.getUrl(record, avatarFileName)
      : undefined;

    // Handle roles as array
    const rolesRaw = record['roles'];
    const roles: string[] = Array.isArray(rolesRaw) 
      ? rolesRaw as string[]
      : (rolesRaw ? [rolesRaw as string] : []);

    return {
      id: record['id'] as string,
      email: record['email'] as string,
      name: record['name'] as string,
      avatar: avatarUrl,
      emailVisibility: record['emailVisibility'] as boolean | undefined,
      roles,
      isActive: (record['isActive'] as boolean | undefined) ?? true,
      isDeleted: (record['isDeleted'] as boolean | undefined) ?? false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  /**
   * Get paginated users with roles information
   */
  async getUsers(options: ListOptions = {}): Promise<PaginatedResult<UserWithRoles>> {
    const { page = 1, limit = 20, sort, order = 'asc', filter } = options;
    
    await this.ensureDbAvailable();
    
    const sortStr = sort ? `${order === 'desc' ? '-' : ''}${sort}` : '-created';
    
    const result = await pb.collection(this.collectionName).getList(page, limit, {
      sort: sortStr,
      filter: filter || '',
      expand: 'roles',
    });

    return {
      items: result.items.map((record) => {
        const user = this.mapRecord(record);
        const expandedRoles = record.expand?.['roles'] as Record<string, unknown>[] | undefined;
        const roleNames = expandedRoles?.map(r => r['name'] as string) || [];
        return {
          ...user,
          roleNames,
        };
      }),
      page: result.page,
      limit: result.perPage,
      total: result.totalItems,
      totalPages: result.totalPages,
    };
  }

  /**
   * Get user by ID with expanded roles information
   */
  async getUserWithRoles(id: string): Promise<UserWithRoles> {
    await this.ensureDbAvailable();

    try {
      const record = await pb.collection(this.collectionName).getOne(id, {
        expand: 'roles',
      });

      const user = this.mapRecord(record);
      const expandedRoles = record.expand?.['roles'] as Record<string, unknown>[] | undefined;
      const roleNames = expandedRoles?.map(r => r['name'] as string) || [];

      return {
        ...user,
        roleNames,
      };
    } catch {
      throw new NotFoundError(`User with id '${id}' not found`);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, input: UserUpdateInput, actorId?: string): Promise<User> {
    return this.update(id, input as Partial<Omit<User, 'id' | 'created' | 'updated'>>, actorId);
  }

  /**
   * Assign roles to user (replaces all existing roles)
   */
  async assignRoles(userId: string, assignment: UserRoleAssignment): Promise<User> {
    await this.ensureDbAvailable();

    // Validate roleIds
    if (assignment.roleIds.length === 0) {
      throw new BadRequestError('At least one role ID is required');
    }

    // Verify all roles exist
    for (const roleId of assignment.roleIds) {
      try {
        await pb.collection(Collections.ROLES).getOne(roleId);
      } catch {
        throw new BadRequestError(`Role with id '${roleId}' not found`);
      }
    }

    // Update user's roles
    try {
      const record = await pb.collection(this.collectionName).update(userId, {
        roles: assignment.roleIds,
      });
      this.invalidateCache();

      this.log.info('Roles assigned to user', { userId, roleIds: assignment.roleIds });
      return this.mapRecord(record);
    } catch {
      throw new NotFoundError(`User with id '${userId}' not found`);
    }
  }

  /**
   * Add a role to user (keeps existing roles)
   */
  async addRole(userId: string, roleId: string): Promise<User> {
    await this.ensureDbAvailable();

    // Verify role exists
    try {
      await pb.collection(Collections.ROLES).getOne(roleId);
    } catch {
      throw new BadRequestError(`Role with id '${roleId}' not found`);
    }

    // Get current user
    const currentUser = await this.getById(userId);
    const currentRoles = currentUser.roles || [];

    // Check if role already assigned
    if (currentRoles.includes(roleId)) {
      return currentUser; // Already has role, no change needed
    }

    // Add new role
    const newRoles = [...currentRoles, roleId];

    try {
      const record = await pb.collection(this.collectionName).update(userId, {
        roles: newRoles,
      });
      this.invalidateCache();

      this.log.info('Role added to user', { userId, roleId });
      return this.mapRecord(record);
    } catch {
      throw new NotFoundError(`User with id '${userId}' not found`);
    }
  }

  /**
   * Remove a specific role from user
   */
  async removeRole(userId: string, roleId: string): Promise<User> {
    await this.ensureDbAvailable();

    // Get current user
    const currentUser = await this.getById(userId);
    const currentRoles = currentUser.roles || [];

    // Remove the role
    const newRoles = currentRoles.filter(id => id !== roleId);

    try {
      const record = await pb.collection(this.collectionName).update(userId, {
        roles: newRoles,
      });
      this.invalidateCache();

      this.log.info('Role removed from user', { userId, roleId });
      return this.mapRecord(record);
    } catch {
      throw new NotFoundError(`User with id '${userId}' not found`);
    }
  }

  /**
   * Remove all roles from user
   */
  async removeAllRoles(userId: string): Promise<User> {
    await this.ensureDbAvailable();

    try {
      const record = await pb.collection(this.collectionName).update(userId, {
        roles: [],
      });
      this.invalidateCache();

      this.log.info('All roles removed from user', { userId });
      return this.mapRecord(record);
    } catch {
      throw new NotFoundError(`User with id '${userId}' not found`);
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: string): Promise<User[]> {
    await this.ensureDbAvailable();

    const records = await pb.collection(this.collectionName).getFullList({
      filter: `roles ~ "${roleId}"`,
    });

    return records.map((r) => this.mapRecord(r));
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const userService = new UserService();
