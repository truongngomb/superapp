import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/index.js';
import { 
  UserCreateInput, 
  UserUpdateInput, 
  UserRoleAssignment, 
  Resources, 
  Actions 
} from '../types/index.js';
import { hasPermission, ForbiddenError } from '../middleware/index.js';
import { logger } from '../utils/index.js';

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /users - Get paginated list of users
 */
export const getAll = async (req: Request, res: Response, _next: NextFunction) => {
  const { page, limit, sort, order, search, isActive, isDeleted } = req.query;

  // Security: Restricted access to trashed items (isDeleted=true)
  if (isDeleted === 'true') {
    const canManage = hasPermission(req.user?.permissions || {}, Resources.USERS, Actions.MANAGE);
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to view deleted users');
    }
  }
  
  // Build filter string for PocketBase
  const filters: string[] = [];
  if (typeof search === 'string' && search.trim()) {
    const sanitized = search.replace(/["%\\]/g, '');
    filters.push(`(name ~ "${sanitized}" || email ~ "${sanitized}")`);
  }
  
  if (isActive !== undefined) filters.push(`isActive = ${isActive === 'true' ? 'true' : 'false'}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${isDeleted === 'true' ? 'true' : 'false'}`);
  
  const result = await userService.getPage({
    page: typeof page === 'string' ? parseInt(page, 10) : undefined,
    limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
    sort: sort as string,
    order: order as 'asc' | 'desc',
    filter: filters.length > 0 ? filters.join(' && ') : undefined
  });
  
  res.json({ success: true, data: result });
};

/**
 * GET /users/export - Get all users for export (no pagination)
 */
export const getAllForExport = async (req: Request, res: Response, _next: NextFunction) => {
  const { sort, order, search, isActive, isDeleted } = req.query;

  // Security check for deleted items
  if (isDeleted === 'true') {
    const canManage = hasPermission(req.user?.permissions || {}, Resources.USERS, Actions.MANAGE);
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to view deleted users');
    }
  }
  
  const filters: string[] = [];
  if (typeof search === 'string' && search.trim()) {
    const sanitized = search.replace(/["%\\]/g, '');
    filters.push(`(name ~ "${sanitized}" || email ~ "${sanitized}")`);
  }
  if (isActive !== undefined) filters.push(`isActive = ${isActive === 'true' ? 'true' : 'false'}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${isDeleted === 'true' ? 'true' : 'false'}`);
  
  const result = await userService.getAllFiltered({
    sort: sort as string,
    order: order as 'asc' | 'desc',
    filter: filters.length > 0 ? filters.join(' && ') : undefined
  });
  
  res.json({ success: true, data: result });
};

/**
 * GET /users/:id - Get user by ID with roles info
 */
export const getById = async (req: Request, res: Response, _next: NextFunction) => {
  const user = await userService.getById(req.params['id'] as string);
  res.json({ success: true, data: user });
};

/**
 * POST /users - Create new user (admin only)
 */
export const create = async (req: Request, res: Response, _next: NextFunction) => {
  const user = await userService.create(req.body as UserCreateInput, req.user?.id);
  res.status(201).json({ success: true, data: user });
};

/**
 * PUT /users/:id - Update user profile
 */
export const update = async (req: Request, res: Response, _next: NextFunction) => {
  const user = await userService.updateProfile(
    req.params['id'] as string,
    req.body as UserUpdateInput,
    req.user?.id
  );
  res.json({ success: true, data: user });
};

/**
 * POST /users/:id/restore - Restore soft-deleted user
 */
export const restore = async (req: Request, res: Response, _next: NextFunction) => {
  await userService.restore(req.params['id'] as string, req.user?.id);
  res.status(200).json({ success: true });
};

/**
 * DELETE /users/:id - Delete user (soft delete by default)
 */
export const remove = async (req: Request, res: Response, _next: NextFunction) => {
  const id = req.params['id'] as string;
  const user = await userService.getById(id);
  
  if (user.isDeleted) {
    await userService.hardDelete(id, req.user?.id);
  } else {
    await userService.delete(id, req.user?.id);
  }
  
  res.status(204).send();
};

/**
 * POST /users/batch-delete - Batch delete users
 */
export const batchDelete = async (req: Request, res: Response, _next: NextFunction) => {
  const { ids } = req.body as { ids: string[] };
  
  await Promise.all(ids.map(async (id) => {
    try {
      const user = await userService.getById(id);
      if (user.isDeleted) {
        await userService.hardDelete(id, req.user?.id);
      } else {
        await userService.delete(id, req.user?.id);
      }
    } catch (error) {
      logger.warn('UserController', `Batch delete failed for user ${id}`, { error });
    }
  }));
  
  res.status(204).send();
};

/**
 * POST /users/batch-status - Batch update users status
 */
export const batchUpdateStatus = async (req: Request, res: Response, _next: NextFunction) => {
  const { ids, isActive } = req.body as { ids: string[]; isActive: boolean };
  await userService.updateMany(ids, { isActive }, req.user?.id);
  res.status(200).json({ success: true });
};

/**
 * POST /users/batch-restore - Batch restore users
 */
export const batchRestore = async (req: Request, res: Response, _next: NextFunction) => {
  const { ids } = req.body as { ids: string[] };
  await userService.restoreMany(ids, req.user?.id);
  res.status(200).json({ success: true });
};

/**
 * PUT /users/:id/roles - Assign roles to user (replaces all)
 */
export const assignRoles = async (req: Request, res: Response, _next: NextFunction) => {
  const user = await userService.assignRoles(
    req.params['id'] as string,
    req.body as UserRoleAssignment,
    req.user?.id
  );
  res.json({ success: true, data: user });
};

/**
 * POST /users/:id/roles/:roleId - Add a role to user
 */
export const addRole = async (req: Request, res: Response, _next: NextFunction) => {
  const user = await userService.addRole(
    req.params['id'] as string,
    req.params['roleId'] as string,
    req.user?.id
  );
  res.json({ success: true, data: user });
};

/**
 * DELETE /users/:id/roles/:roleId - Remove a specific role from user
 */
export const removeRole = async (req: Request, res: Response, _next: NextFunction) => {
  const user = await userService.removeRole(
    req.params['id'] as string,
    req.params['roleId'] as string,
    req.user?.id
  );
  res.json({ success: true, data: user });
};

/**
 * DELETE /users/:id/roles - Remove all roles from user
 */
export const removeAllRoles = async (req: Request, res: Response, _next: NextFunction) => {
  const user = await userService.removeAllRoles(req.params['id'] as string, req.user?.id);
  res.json({ success: true, data: user });
};

/**
 * GET /users/me - Get current authenticated user
 */
export const getMe = async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  
  const user = await userService.getById(userId);
  res.json({ success: true, data: user });
};

/**
 * PUT /users/me - Update current user's profile
 */
export const updateMe = async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user?.id;
  
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  
  const user = await userService.updateProfile(userId, req.body as UserUpdateInput, userId);
  res.json({ success: true, data: user });
};
