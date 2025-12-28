import { Router } from 'express';
import { asyncHandler, requirePermission } from '../middleware/index.js';
import { categoryController } from '../controllers/index.js';
import { Resources, Actions } from '../types/index.js';

export const categoriesRouter = Router();

categoriesRouter.get(
  '/',
  asyncHandler(categoryController.getAll)
);

categoriesRouter.get(
  '/:id',
  asyncHandler(categoryController.getById)
);

categoriesRouter.post(
  '/',
  requirePermission(Resources.CATEGORIES, Actions.CREATE),
  asyncHandler(categoryController.create)
);

categoriesRouter.put(
  '/:id',
  requirePermission(Resources.CATEGORIES, Actions.UPDATE),
  asyncHandler(categoryController.update)
);

categoriesRouter.delete(
  '/:id',
  requirePermission(Resources.CATEGORIES, Actions.DELETE),
  asyncHandler(categoryController.remove)
);
