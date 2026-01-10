/**
 * User Service
 * 
 * Handles CRUD operations for user management.
 */
import { BaseService } from './base.service.js';
import { Collections, CacheKeys } from '../config/index.js';
import { BadRequestError } from '../middleware/index.js';
import type { User, UserUpdateInput, UserRoleAssignment } from '../types/index.js';

// =============================================================================
// Types
// =============================================================================

/** @deprecated Use User directly - roleNames is now part of User */
export type UserWithRoles = User;

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * Service for managing users
 */
class UserService extends BaseService<User> {
  protected readonly collectionName = Collections.USERS;
  protected readonly cacheKey = CacheKeys.USERS;
  protected readonly defaultFilter = 'isDeleted = false';
  protected readonly defaultExpand = 'roles';

  protected mapRecord(record: Record<string, unknown>): User {
    const avatarFileName = record['avatar'] as string | undefined;
    const avatarUrl = avatarFileName 
      ? this.db.files.getUrl(record, avatarFileName)
      : undefined;

    const rolesRaw = record['roles'];
    const roles: string[] = Array.isArray(rolesRaw) 
      ? rolesRaw as string[]
      : (rolesRaw ? [rolesRaw as string] : []);

    // Extract roleNames from expanded roles (if present)
    const expand = record['expand'] as Record<string, unknown> | undefined;
    const expandedRoles = expand?.['roles'] as Record<string, unknown>[] | undefined;
    const roleNames = expandedRoles?.map(r => r['name'] as string);

    return {
      id: record['id'] as string,
      email: record['email'] as string,
      name: record['name'] as string,
      avatar: avatarUrl,
      emailVisibility: record['emailVisibility'] as boolean | undefined,
      roles,
      roleNames, // Included when expand='roles'
      isActive: (record['isActive'] as boolean | undefined) ?? true,
      isDeleted: (record['isDeleted'] as boolean | undefined) ?? false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  // getPage() inherited from BaseService with defaultExpand = 'roles'
  // Returns User with roleNames populated

  /**
   * Get user by ID with expanded roles (alias for getById)
   * @deprecated Use getById() directly
   */
  async getUserWithRoles(id: string): Promise<User> {
    return this.getById(id);
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
  async assignRoles(userId: string, assignment: UserRoleAssignment, actorId?: string): Promise<User> {
    if (assignment.roleIds.length === 0) {
      throw new BadRequestError('At least one role ID is required');
    }

    // Verify all roles exist
    await this.ensureDbAvailable();
    for (const roleId of assignment.roleIds) {
      const exists = await this.roleExists(roleId);
      if (!exists) throw new BadRequestError(`Role with id '${roleId}' not found`);
    }

    return this.update(userId, { roles: assignment.roleIds } as Partial<Omit<User, 'id' | 'created' | 'updated'>>, actorId);
  }

  /**
   * Add a role to user (keeps existing roles)
   */
  async addRole(userId: string, roleId: string, actorId?: string): Promise<User> {
    const exists = await this.roleExists(roleId);
    if (!exists) throw new BadRequestError(`Role with id '${roleId}' not found`);

    const currentUser = await this.getById(userId);
    const currentRoles = currentUser.roles || [];

    if (currentRoles.includes(roleId)) return currentUser;

    return this.update(userId, { roles: [...currentRoles, roleId] } as Partial<Omit<User, 'id' | 'created' | 'updated'>>, actorId);
  }

  /**
   * Remove a specific role from user
   */
  async removeRole(userId: string, roleId: string, actorId?: string): Promise<User> {
    const currentUser = await this.getById(userId);
    const newRoles = (currentUser.roles || []).filter(id => id !== roleId);
    return this.update(userId, { roles: newRoles } as Partial<Omit<User, 'id' | 'created' | 'updated'>>, actorId);
  }

  /**
   * Remove all roles from user
   */
  async removeAllRoles(userId: string, actorId?: string): Promise<User> {
    return this.update(userId, { roles: [] } as Partial<Omit<User, 'id' | 'created' | 'updated'>>, actorId);
  }

  /**
   * Get users by role (uses BaseService filter)
   */
  async getUsersByRole(roleId: string): Promise<User[]> {
    await this.ensureDbAvailable();
    const records = await this.collection.getFullList({ filter: `roles ~ "${roleId}"` });
    return records.map(r => this.mapRecord(r));
  }

  /**
   * Check if role exists
   */
  private async roleExists(roleId: string): Promise<boolean> {
    try {
      await this.db.collection(Collections.ROLES).getOne(roleId);
      return true;
    } catch {
      return false;
    }
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const userService = new UserService();
