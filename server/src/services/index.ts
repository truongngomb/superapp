/**
 * Services Module - Central Service Exports
 * 
 * @example
 * ```typescript
 * import { categoryService, roleService, authService } from './services/index.js';
 * 
 * // Use service methods
 * const categories = await categoryService.getAll();
 * const role = await roleService.getById('abc123');
 * ```
 */

// Base
export { BaseService } from './baseService.js';
export type { ListOptions, PaginatedResult } from './baseService.js';

// Domain services
export { categoryService } from './categoryService.js';
export { roleService } from './roleService.js';

// Auth & Permissions
export { authService } from './authService.js';
export type { GoogleAuthInitResult, OAuthResult } from './authService.js';

export { permissionService, getUserPermissions } from './permissionService.js';