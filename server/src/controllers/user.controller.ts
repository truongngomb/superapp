/**
 * User Controller
 * 
 * Handles HTTP requests for user management operations.
 */
import { Request, Response } from 'express';
import { userService } from '../services/index.js';
import type { UserUpdateInput, UserRoleAssignment } from '../types/index.js';

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /users - Get paginated list of users
 */
export const getAll = async (req: Request, res: Response) => {
  const { page, limit, sort, order, filter } = req.query;
  
  const users = await userService.getPage({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sort: sort as string | undefined,
    order: order as 'asc' | 'desc' | undefined,
    filter: filter as string | undefined,
  });
  
  res.json({ success: true, data: users });
};

/**
 * GET /users/:id - Get user by ID with roles info
 */
export const getById = async (req: Request, res: Response) => {
  const user = await userService.getById(req.params['id'] as string);
  res.json({ success: true, data: user });
};

/**
 * PUT /users/:id - Update user profile
 */
export const update = async (req: Request, res: Response) => {
  const user = await userService.updateProfile(
    req.params['id'] as string,
    req.body as UserUpdateInput,
    req.user?.id
  );
  res.json({ success: true, data: user });
};

/**
 * DELETE /users/:id - Delete user
 * Note: Be careful with this operation
 */
export const remove = async (req: Request, res: Response) => {
  await userService.delete(req.params['id'] as string, req.user?.id);
  res.status(204).send();
};

/**
 * PUT /users/:id/roles - Assign roles to user (replaces all)
 */
export const assignRoles = async (req: Request, res: Response) => {
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
export const addRole = async (req: Request, res: Response) => {
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
export const removeRole = async (req: Request, res: Response) => {
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
export const removeAllRoles = async (req: Request, res: Response) => {
  const user = await userService.removeAllRoles(req.params['id'] as string, req.user?.id);
  res.json({ success: true, data: user });
};

/**
 * GET /users/me - Get current authenticated user
 */
export const getMe = async (req: Request, res: Response) => {
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
export const updateMe = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  if (!userId) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }
  
  const user = await userService.updateProfile(userId, req.body as UserUpdateInput, userId);
  res.json({ success: true, data: user });
};
