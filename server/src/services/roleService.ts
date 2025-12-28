import { BaseService } from './baseService.js';
import { Collections } from '../config/index.js';
import type { Role, RolePermissions, CreateRoleInput, UpdateRoleInput } from '../types/index.js';

/**
 * Service for managing user Roles and their permissions.
 * Extends BaseService for standard CRUD operations.
 */
class RoleService extends BaseService<Role> {
  protected collectionName = Collections.ROLES;
  protected cacheKey = 'roles';

  protected mapRecord(record: Record<string, unknown>): Role {
    return {
      id: record['id'] as string,
      name: record['name'] as string,
      description: record['description'] as string,
      permissions: (record['permissions'] as RolePermissions) || {},
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  // Aliases for backward/interface compatibility if needed, 
  // but better to use standard crud names in new code
  
  /**
   * Get all roles
   */
  async getRoles() { return this.getAll(); }

  /**
   * Get a role by its ID
   */
  async getRoleById(id: string) { return this.getById(id); }

  /**
   * Create a new role
   */
  async createRole(input: CreateRoleInput) { return this.create(input); }

  /**
   * Update an existing role
   */
  async updateRole(id: string, input: UpdateRoleInput) { return this.update(id, input); }

  /**
   * Delete a role by ID
   */
  async deleteRole(id: string) { return this.delete(id); }
}

export const roleService = new RoleService();
export const getRoles = roleService.getRoles.bind(roleService);
export const getRoleById = roleService.getRoleById.bind(roleService);
export const createRole = roleService.createRole.bind(roleService);
export const updateRole = roleService.updateRole.bind(roleService);
export const deleteRole = roleService.deleteRole.bind(roleService);
