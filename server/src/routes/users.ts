/**
 * User Routes
 * 
 * RESTful endpoints for user management.
 */
import { Router } from 'express';
import { asyncHandler, requireAuth, requirePermission, validateBody } from '../middleware/index.js';
import { userController } from '../controllers/index.js';
import { UserUpdateSchema, UserRoleAssignmentSchema } from '../schemas/index.js';
import { Resources, Actions } from '../types/index.js';

export const usersRouter = Router();

// =============================================================================
// Current User Routes (requires auth only)
// =============================================================================

/** GET /users/me - Get current user's profile */
usersRouter.get(
  '/me',
  requireAuth,
  asyncHandler(userController.getMe)
);

/** PUT /users/me - Update current user's profile */
usersRouter.put(
  '/me',
  requireAuth,
  validateBody(UserUpdateSchema),
  asyncHandler(userController.updateMe)
);

// =============================================================================
// Admin Routes (requires permission)
// =============================================================================

/** GET /users - List all users */
usersRouter.get(
  '/',
  requirePermission(Resources.USERS, Actions.VIEW),
  asyncHandler(userController.getAll)
);

/** GET /users/:id - Get user by ID */
usersRouter.get(
  '/:id',
  requirePermission(Resources.USERS, Actions.VIEW),
  asyncHandler(userController.getById)
);

/** PUT /users/:id - Update user */
usersRouter.put(
  '/:id',
  requirePermission(Resources.USERS, Actions.UPDATE),
  validateBody(UserUpdateSchema),
  asyncHandler(userController.update)
);

/** DELETE /users/:id - Delete user */
usersRouter.delete(
  '/:id',
  requirePermission(Resources.USERS, Actions.DELETE),
  asyncHandler(userController.remove)
);

// =============================================================================
// Role Assignment Routes (Multi-role support)
// =============================================================================

/** PUT /users/:id/roles - Assign roles to user (replaces all) */
usersRouter.put(
  '/:id/roles',
  requirePermission(Resources.USERS, Actions.UPDATE),
  validateBody(UserRoleAssignmentSchema),
  asyncHandler(userController.assignRoles)
);

/** POST /users/:id/roles/:roleId - Add a single role to user */
usersRouter.post(
  '/:id/roles/:roleId',
  requirePermission(Resources.USERS, Actions.UPDATE),
  asyncHandler(userController.addRole)
);

/** DELETE /users/:id/roles/:roleId - Remove a specific role from user */
usersRouter.delete(
  '/:id/roles/:roleId',
  requirePermission(Resources.USERS, Actions.UPDATE),
  asyncHandler(userController.removeRole)
);

/** DELETE /users/:id/roles - Remove all roles from user */
usersRouter.delete(
  '/:id/roles',
  requirePermission(Resources.USERS, Actions.UPDATE),
  asyncHandler(userController.removeAllRoles)
);
