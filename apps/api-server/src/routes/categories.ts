/**
 * Category Routes
 * 
 * RESTful endpoints for category management.
 */
import { Router } from 'express';
import { asyncHandler, requirePermission, validateBody, batchOperationLimit } from '../middleware/index.js';
import { categoryController } from '../controllers/index.js';
import { CategoryCreateSchema, CategoryUpdateSchema, BatchDeleteSchema, BatchUpdateStatusSchema, BatchRestoreSchema } from '../schemas/index.js';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';


export const categoriesRouter: Router = Router();

// =============================================================================
// Public Routes
// =============================================================================

/** GET /categories - List all categories */
categoriesRouter.get(
  '/',
  requirePermission(PermissionResource.Categories, PermissionAction.View),

  asyncHandler(categoryController.getAll)
);

/** GET /categories/export - Get all categories for export (no pagination) */
categoriesRouter.get(
  '/export',
  requirePermission(PermissionResource.Categories, PermissionAction.View),

  asyncHandler(categoryController.getAllForExport)
);

// =============================================================================
// Protected Routes (require authentication + permission)
// =============================================================================

/** POST /categories/batch-delete - Batch delete categories */
categoriesRouter.post(
  '/batch-delete',
  batchOperationLimit,
  requirePermission(PermissionResource.Categories, PermissionAction.Delete),

  validateBody(BatchDeleteSchema),
  asyncHandler(categoryController.batchDelete)
);

/** POST /categories/batch-status - Batch update status */
categoriesRouter.post(
  '/batch-status',
  batchOperationLimit,
  requirePermission(PermissionResource.Categories, PermissionAction.Update),

  validateBody(BatchUpdateStatusSchema),
  asyncHandler(categoryController.batchUpdateStatus)
);

/** POST /categories/batch-restore - Batch restore categories */
categoriesRouter.post(
  '/batch-restore',
  batchOperationLimit,
  requirePermission(PermissionResource.Categories, PermissionAction.Update),

  validateBody(BatchRestoreSchema),
  asyncHandler(categoryController.batchRestore)
);


/** GET /categories/:id - Get category by ID */
categoriesRouter.get(
  '/:id',
  requirePermission(PermissionResource.Categories, PermissionAction.View),

  asyncHandler(categoryController.getById)
);

/** POST /categories - Create new category */
categoriesRouter.post(
  '/',
  requirePermission(PermissionResource.Categories, PermissionAction.Create),

  validateBody(CategoryCreateSchema),
  asyncHandler(categoryController.create)
);

/** PUT /categories/:id - Update category */
categoriesRouter.put(
  '/:id',
  requirePermission(PermissionResource.Categories, PermissionAction.Update),

  validateBody(CategoryUpdateSchema),
  asyncHandler(categoryController.update)
);

/** POST /categories/:id/restore - Restore soft-deleted category */
categoriesRouter.post(
  '/:id/restore',
  requirePermission(PermissionResource.Categories, PermissionAction.Update),

  asyncHandler(categoryController.restore)
);

/** DELETE /categories/:id - Delete category */
categoriesRouter.delete(
  '/:id',
  requirePermission(PermissionResource.Categories, PermissionAction.Delete),

  asyncHandler(categoryController.remove)
);
