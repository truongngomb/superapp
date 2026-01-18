/**
 * Category Controller
 * 
 * Handles HTTP requests for category operations.
 */
import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/index.js';
import { CategoryCreateInput, CategoryUpdateInput } from '../types/index.js';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';
import { hasPermission, ForbiddenError } from '../middleware/index.js';
import { logger } from '../utils/index.js';

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /categories - Get paginated categories
 */
export const getAll = async (req: Request, res: Response, _next: NextFunction) => {
  const { page, limit, sort, order, search, color, isActive, isDeleted } = req.query;

  // Security: Restricted access to trashed items (isDeleted=true)
  // Only admins or users with 'manage' permission can view deleted items
  if (isDeleted === 'true') {
    const canManage = hasPermission(req.user?.permissions || {}, PermissionResource.Categories, PermissionAction.Manage);

    if (!canManage) {
      throw new ForbiddenError('You do not have permission to view deleted categories');
    }
  }
  
  // Build filter string for PocketBase
  const filters: string[] = [];
  // Sanitize search input to prevent injection
  if (typeof search === 'string' && search.trim()) {
    const sanitized = search.replace(/["%\\]/g, '');
    filters.push(`(name ~ "${sanitized}" || description ~ "${sanitized}")`);
  }
  // Validate color format before adding to filter
  if (typeof color === 'string' && /^#[0-9A-Fa-f]{6,8}$/.test(color)) {
    filters.push(`color = "${color}"`);
  }
  if (isActive !== undefined) filters.push(`isActive = ${isActive === 'true' ? 'true' : 'false'}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${isDeleted === 'true' ? 'true' : 'false'}`);
  
  const result = await categoryService.getPage({
    page: typeof page === 'string' ? parseInt(page, 10) : undefined,
    limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
    sort: sort as string,
    order: order as 'asc' | 'desc',
    filter: filters.length > 0 ? filters.join(' && ') : undefined
  });
  
  res.json({ success: true, data: result });
};

/**
 * GET /categories/export - Get all categories for export (no pagination)
 */
export const getAllForExport = async (req: Request, res: Response, _next: NextFunction) => {
  const { sort, order, search, color, isActive, isDeleted } = req.query;

  // Security: Restricted access to trashed items (isDeleted=true)
  if (isDeleted === 'true') {
    const canManage = hasPermission(req.user?.permissions || {}, PermissionResource.Categories, PermissionAction.Manage);

    if (!canManage) {
      throw new ForbiddenError('You do not have permission to view deleted categories');
    }
  }
  
  // Build filter string for PocketBase
  const filters: string[] = [];
  if (typeof search === 'string' && search.trim()) {
    const sanitized = search.replace(/["%\\]/g, '');
    filters.push(`(name ~ "${sanitized}" || description ~ "${sanitized}")`);
  }
  if (typeof color === 'string' && /^#[0-9A-Fa-f]{6,8}$/.test(color)) {
    filters.push(`color = "${color}"`);
  }
  if (isActive !== undefined) filters.push(`isActive = ${isActive === 'true' ? 'true' : 'false'}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${isDeleted === 'true' ? 'true' : 'false'}`);
  
  const result = await categoryService.getAllFiltered({
    sort: sort as string,
    order: order as 'asc' | 'desc',
    filter: filters.length > 0 ? filters.join(' && ') : undefined
  });
  
  res.json({ success: true, data: result });
};

/**
 * GET /categories/:id - Get category by ID
 */
export const getById = async (req: Request, res: Response, _next: NextFunction) => {
  const category = await categoryService.getById(req.params['id'] as string);
  res.json({ success: true, data: category });
};

/**
 * POST /categories - Create new category
 */
export const create = async (req: Request, res: Response, _next: NextFunction) => {
  // Body is already validated by middleware (validateBody)
  const category = await categoryService.create(req.body as unknown as CategoryCreateInput, req.user?.id);
  res.status(201).json({ success: true, data: category });
};

/**
 * PUT /categories/:id - Update category
 */
export const update = async (req: Request, res: Response, _next: NextFunction) => {
  const category = await categoryService.update(
    req.params['id'] as string,
    req.body as unknown as CategoryUpdateInput,
    req.user?.id
  );
  res.json({ success: true, data: category });
};

/**
 * POST /categories/:id/restore - Restore soft-deleted category
 */
export const restore = async (req: Request, res: Response, _next: NextFunction) => {
  await categoryService.restore(req.params['id'] as string, req.user?.id);
  res.status(200).json({ success: true });
};

/**
 * DELETE /categories/:id - Delete category
 */
export const remove = async (req: Request, res: Response, _next: NextFunction) => {
  const id = req.params['id'] as string;
  const category = await categoryService.getById(id);
  
  if (category.isDeleted) {
    await categoryService.hardDelete(id, req.user?.id);
  } else {
    await categoryService.delete(id, req.user?.id);
  }
  
  res.status(204).send();
};

/**
 * POST /categories/batch-delete - Batch delete categories
 */
export const batchDelete = async (req: Request, res: Response, _next: NextFunction) => {
  const { ids } = req.body as { ids: string[] };
  
  // To handle mixed hard/soft delete in batch, we need to check each one
  // or simply perform a query to find which ones are already deleted
  await Promise.all(ids.map(async (id) => {
    try {
      const category = await categoryService.getById(id);
      if (category.isDeleted) {
        await categoryService.hardDelete(id, req.user?.id);
      } else {
        await categoryService.delete(id, req.user?.id);
      }
    } catch (error) {
      // Ignore if not found during batch, but log for debugging
      logger.warn('CategoryController', `Batch delete failed for category ${id}`, { error });
    }
  }));
  
  res.status(204).send();
};

/**
 * POST /categories/batch-status - Batch update categories status
 */
export const batchUpdateStatus = async (req: Request, res: Response, _next: NextFunction) => {
  const { ids, isActive } = req.body as { ids: string[]; isActive: boolean };
  await categoryService.updateMany(ids, { isActive }, req.user?.id);
  res.status(200).json({ success: true });
};

/**
 * POST /categories/batch-restore - Batch restore categories
 */
export const batchRestore = async (req: Request, res: Response, _next: NextFunction) => {
  const { ids } = req.body as { ids: string[] };
  await categoryService.restoreMany(ids, req.user?.id);
  res.status(200).json({ success: true });
};

