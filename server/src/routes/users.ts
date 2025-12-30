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

/** PUT /users/:id/role - Assign role to user */
usersRouter.put(
  '/:id/role',
  requirePermission(Resources.USERS, Actions.UPDATE),
  validateBody(UserRoleAssignmentSchema),
  asyncHandler(userController.assignRole)
);

/** DELETE /users/:id/role - Remove role from user */
usersRouter.delete(
  '/:id/role',
  requirePermission(Resources.USERS, Actions.UPDATE),
  asyncHandler(userController.removeRole)
);
