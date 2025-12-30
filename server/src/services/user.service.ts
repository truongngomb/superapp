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
// Service Implementation
// =============================================================================

/**
 * Service for managing users
 */
class UserService extends BaseService<User> {
  protected readonly collectionName = Collections.USERS;
  protected readonly cacheKey = CacheKeys.USERS;

  protected mapRecord(record: Record<string, unknown>): User {
    return {
      id: record['id'] as string,
      email: record['email'] as string,
      name: record['name'] as string,
      avatar: (record['avatar'] as string) || undefined,
      emailVisibility: record['emailVisibility'] as boolean | undefined,
      role: (record['role'] as string) || undefined,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  /**
   * Get paginated users with optional filters
   */
  async getUsers(options: ListOptions = {}): Promise<PaginatedResult<User>> {
    return this.getPage({ ...options, sort: options.sort || 'created' });
  }

  /**
   * Get user by ID with expanded role information
   */
  async getUserWithRole(id: string): Promise<User & { roleName?: string }> {
    await this.ensureDbAvailable();

    try {
      const record = await pb.collection(this.collectionName).getOne(id, {
        expand: 'role',
      });

      const user = this.mapRecord(record);
      const expandedRole = record.expand?.['role'] as Record<string, unknown> | undefined;

      return {
        ...user,
        roleName: expandedRole?.['name'] as string | undefined,
      };
    } catch {
      throw new NotFoundError(`User with id '${id}' not found`);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, input: UserUpdateInput): Promise<User> {
    return this.update(id, input as Partial<Omit<User, 'id' | 'created' | 'updated'>>);
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, assignment: UserRoleAssignment): Promise<User> {
    await this.ensureDbAvailable();

    // Validate roleId is a valid string
    if (!assignment.roleId || typeof assignment.roleId !== 'string') {
      throw new BadRequestError('Role ID is required and must be a string');
    }
    const roleId = assignment.roleId; // Now TypeScript knows this is definitely string

    // Verify role exists
    try {
      await pb.collection(Collections.ROLES).getOne(roleId);
    } catch {
      throw new BadRequestError(`Role with id '${assignment.roleId}' not found`);
    }

    // Update user's role
    try {
      const record = await pb.collection(this.collectionName).update(userId, {
        role: assignment.roleId,
      });
      this.invalidateCache();

      this.log.info('Role assigned to user', { userId, roleId: assignment.roleId });
      return this.mapRecord(record);
    } catch {
      throw new NotFoundError(`User with id '${userId}' not found`);
    }
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: string): Promise<User> {
    await this.ensureDbAvailable();

    try {
      const record = await pb.collection(this.collectionName).update(userId, {
        role: null,
      });
      this.invalidateCache();

      this.log.info('Role removed from user', { userId });
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
      filter: `role = "${roleId}"`,
    });

    return records.map((r) => this.mapRecord(r));
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const userService = new UserService();
