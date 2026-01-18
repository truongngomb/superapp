/**
 * Markdown Pages Routes
 * RESTful endpoints for markdown page management
 */
import { Router } from 'express';
import { asyncHandler, requirePermission, validateBody, batchOperationLimit } from '../middleware/index.js';
import * as markdownController from '../controllers/markdown.controller.js';
import { 
  MarkdownPageCreateSchema, 
  MarkdownPageUpdateSchema, 
  BatchDeleteSchema, 
  BatchUpdateStatusSchema, 
  BatchRestoreSchema 
} from '@superapp/shared-types';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';

export const markdownRouter: Router = Router();

// =============================================================================
// Public Routes (no authentication required)
// =============================================================================

/** GET /markdown-pages/slug/:slug - Get published page by slug */
markdownRouter.get(
  '/slug/:slug',
  asyncHandler(markdownController.getBySlug)
);

/** GET /markdown-pages/menu/:position - Get menu tree */
markdownRouter.get(
  '/menu/:position',
  asyncHandler(markdownController.getMenuTree)
);

// =============================================================================
// Protected Routes (require authentication + permission)
// =============================================================================

/** GET /markdown-pages - List all pages (Admin) */
markdownRouter.get(
  '/',
  requirePermission(PermissionResource.MarkdownPages, PermissionAction.View),
  asyncHandler(markdownController.getAll)
);

/** GET /markdown-pages/export - Export all pages */
markdownRouter.get(
  '/export',
  requirePermission(PermissionResource.MarkdownPages, PermissionAction.View),
  asyncHandler(markdownController.getAllForExport)
);

/** POST /markdown-pages/batch-delete - Batch delete pages */
markdownRouter.post(
  '/batch-delete',
  batchOperationLimit,
  requirePermission(PermissionResource.MarkdownPages, PermissionAction.Delete),
  validateBody(BatchDeleteSchema),
  asyncHandler(markdownController.batchDelete)
);

/** POST /markdown-pages/batch-status - Batch update status */
markdownRouter.post(
  '/batch-status',
  batchOperationLimit,
  requirePermission(PermissionResource.MarkdownPages, PermissionAction.Update),
  validateBody(BatchUpdateStatusSchema),
  asyncHandler(markdownController.batchUpdateStatus)
);

/** POST /markdown-pages/batch-restore - Batch restore pages */
markdownRouter.post(
  '/batch-restore',
  batchOperationLimit,
  requirePermission(PermissionResource.MarkdownPages, PermissionAction.Update),
  validateBody(BatchRestoreSchema),
  asyncHandler(markdownController.batchRestore)
);

/** GET /markdown-pages/:id - Get page by ID (Admin) */
markdownRouter.get(
  '/:id',
  requirePermission(PermissionResource.MarkdownPages, PermissionAction.View),
  asyncHandler(markdownController.getById)
);

/** POST /markdown-pages - Create new page */
markdownRouter.post(
  '/',
  requirePermission(PermissionResource.MarkdownPages, PermissionAction.Create),
  validateBody(MarkdownPageCreateSchema),
  asyncHandler(markdownController.create)
);

/** PUT /markdown-pages/:id - Update page */
markdownRouter.put(
  '/:id',
  requirePermission(PermissionResource.MarkdownPages, PermissionAction.Update),
  validateBody(MarkdownPageUpdateSchema),
  asyncHandler(markdownController.update)
);

/** POST /markdown-pages/:id/restore - Restore deleted page */
markdownRouter.post(
  '/:id/restore',
  requirePermission(PermissionResource.MarkdownPages, PermissionAction.Update),
  asyncHandler(markdownController.restore)
);

/** DELETE /markdown-pages/:id - Delete page */
markdownRouter.delete(
  '/:id',
  requirePermission(PermissionResource.MarkdownPages, PermissionAction.Delete),
  asyncHandler(markdownController.remove)
);
