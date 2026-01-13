/**
 * Role Routes
 * 
 * RESTful endpoints for role management.
 */
import { Router } from 'express';
import { asyncHandler, requirePermission, validateBody, batchOperationLimit } from '../middleware/index.js';
import { roleController } from '../controllers/index.js';
import { RoleCreateSchema, RoleUpdateSchema, BatchDeleteSchema, BatchUpdateStatusSchema, BatchRestoreSchema } from '../schemas/index.js';
import { Resources, Actions } from '../types/index.js';

export const rolesRouter: Router = Router();

// =============================================================================
// Protected Routes (all role operations require permission)
// =============================================================================

/** GET /roles - List all roles */
rolesRouter.get(
  '/',
  requirePermission(Resources.ROLES, Actions.VIEW),
  asyncHandler(roleController.getAll)
);

/** GET /roles/export - Export roles to Excel (must be before /:id) */
rolesRouter.get(
  '/export',
  requirePermission(Resources.ROLES, Actions.VIEW),
  asyncHandler(roleController.getAllForExport)
);

/** POST /roles/batch-delete - Batch delete roles */
rolesRouter.post(
  '/batch-delete',
  batchOperationLimit,
  requirePermission(Resources.ROLES, Actions.DELETE),
  validateBody(BatchDeleteSchema),
  asyncHandler(roleController.batchDelete)
);

/** POST /roles/batch-status - Batch update status */
rolesRouter.post(
  '/batch-status',
  batchOperationLimit,
  requirePermission(Resources.ROLES, Actions.UPDATE),
  validateBody(BatchUpdateStatusSchema),
  asyncHandler(roleController.batchUpdateStatus)
);

/** POST /roles/batch-restore - Batch restore roles */
rolesRouter.post(
  '/batch-restore',
  batchOperationLimit,
  requirePermission(Resources.ROLES, Actions.UPDATE),
  validateBody(BatchRestoreSchema),
  asyncHandler(roleController.batchRestore)
);

/** GET /roles/:id - Get role by ID */
rolesRouter.get(
  '/:id',
  requirePermission(Resources.ROLES, Actions.VIEW),
  asyncHandler(roleController.getById)
);

/** POST /roles - Create new role */
rolesRouter.post(
  '/',
  requirePermission(Resources.ROLES, Actions.CREATE),
  validateBody(RoleCreateSchema),
  asyncHandler(roleController.create)
);

/** PUT /roles/:id - Update role */
rolesRouter.put(
  '/:id',
  requirePermission(Resources.ROLES, Actions.UPDATE),
  validateBody(RoleUpdateSchema),
  asyncHandler(roleController.update)
);

/** DELETE /roles/:id - Delete role */
rolesRouter.delete(
  '/:id',
  requirePermission(Resources.ROLES, Actions.DELETE),
  asyncHandler(roleController.remove)
);

/** POST /roles/:id/restore - Restore soft-deleted role */
rolesRouter.post(
  '/:id/restore',
  requirePermission(Resources.ROLES, Actions.UPDATE),
  asyncHandler(roleController.restore)
);
