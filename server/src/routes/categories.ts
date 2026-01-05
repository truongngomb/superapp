/**
 * Category Routes
 * 
 * RESTful endpoints for category management.
 */
import { Router } from 'express';
import { asyncHandler, requirePermission, validateBody } from '../middleware/index.js';
import { categoryController } from '../controllers/index.js';
import { CategoryCreateSchema, CategoryUpdateSchema, BatchDeleteSchema } from '../schemas/index.js';
import { Resources, Actions } from '../types/index.js';

export const categoriesRouter = Router();

// =============================================================================
// Public Routes
// =============================================================================

/** GET /categories - List all categories */
categoriesRouter.get(
  '/',
  requirePermission(Resources.CATEGORIES, Actions.VIEW),
  asyncHandler(categoryController.getAll)
);

// =============================================================================
// Protected Routes (require authentication + permission)
// =============================================================================

/** POST /categories/batch-delete - Batch delete categories */
categoriesRouter.post(
  '/batch-delete',
  requirePermission(Resources.CATEGORIES, Actions.DELETE),
  validateBody(BatchDeleteSchema),
  asyncHandler(categoryController.batchDelete)
);

/** GET /categories/:id - Get category by ID */
categoriesRouter.get('/:id', asyncHandler(categoryController.getById));

/** POST /categories - Create new category */
categoriesRouter.post(
  '/',
  requirePermission(Resources.CATEGORIES, Actions.CREATE),
  validateBody(CategoryCreateSchema),
  asyncHandler(categoryController.create)
);

/** PUT /categories/:id - Update category */
categoriesRouter.put(
  '/:id',
  requirePermission(Resources.CATEGORIES, Actions.UPDATE),
  validateBody(CategoryUpdateSchema),
  asyncHandler(categoryController.update)
);

/** POST /categories/:id/restore - Restore soft-deleted category */
categoriesRouter.post(
  '/:id/restore',
  requirePermission(Resources.CATEGORIES, Actions.UPDATE),
  asyncHandler(categoryController.restore)
);

/** DELETE /categories/:id - Delete category */
categoriesRouter.delete(
  '/:id',
  requirePermission(Resources.CATEGORIES, Actions.DELETE),
  asyncHandler(categoryController.remove)
);
