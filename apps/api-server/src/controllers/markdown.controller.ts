/**
 * Markdown Pages Controller
 * Handles HTTP requests for markdown page operations.
 */
import { Request, Response, NextFunction } from 'express';
import { markdownService } from '../services/markdown.service.js';
import { MarkdownPageCreateInput, MarkdownPageUpdateInput } from '@superapp/shared-types';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';
import { hasPermission, ForbiddenError } from '../middleware/index.js';
import { logger } from '../utils/index.js';

// =============================================================================
// Public Handlers
// =============================================================================

/**
 * GET /markdown-pages/slug/:slug - Get published page by slug
 */
export const getBySlug = async (req: Request, res: Response, _next: NextFunction) => {
  const { slug } = req.params;
  const page = await markdownService.getBySlug(slug as string);
  
  if (!page) {
    res.status(404).json({ success: false, message: 'Page not found' });
    return;
  }
  
  res.json({ success: true, data: page });
};

/**
 * GET /markdown-pages/menu - Get menu tree
 */
export const getMenuTree = async (_req: Request, res: Response, _next: NextFunction) => {
  const tree = await markdownService.getMenuTree();
  res.json({ success: true, data: tree });
};

// =============================================================================
// Protected Handlers
// =============================================================================

/**
 * GET /markdown-pages - Get paginated pages
 */
export const getAll = async (req: Request, res: Response, _next: NextFunction) => {
  const { page, limit, sort, order, search, isPublished, showInMenu, isDeleted } = req.query;

  // Security: Restricted access to trashed items
  if (isDeleted === 'true') {
    const canManage = hasPermission(req.user?.permissions || {}, PermissionResource.MarkdownPages, PermissionAction.Manage);
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to view deleted pages');
    }
  }

  // Build filter
  const filters: string[] = [];
  if (typeof search === 'string' && search.trim()) {
    const sanitized = search.replace(/["%\\]/g, '');
    filters.push(`(title ~ "${sanitized}" || slug ~ "${sanitized}")`);
  }
  if (isPublished !== undefined) filters.push(`isPublished = ${isPublished === 'true' ? 'true' : 'false'}`);
  if (showInMenu !== undefined) filters.push(`showInMenu = ${showInMenu === 'true' ? 'true' : 'false'}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${isDeleted === 'true' ? 'true' : 'false'}`);

  const result = await markdownService.getPage({
    page: typeof page === 'string' ? parseInt(page, 10) : undefined,
    limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
    sort: sort as string,
    order: order as 'asc' | 'desc',
    filter: filters.length > 0 ? filters.join(' && ') : undefined
  });

  res.json({ success: true, data: result });
};

/**
 * GET /markdown-pages/export - Get all pages for export
 */
export const getAllForExport = async (req: Request, res: Response, _next: NextFunction) => {
  const { sort, order, search, isPublished, isDeleted } = req.query;

  // Security
  if (isDeleted === 'true') {
    const canManage = hasPermission(req.user?.permissions || {}, PermissionResource.MarkdownPages, PermissionAction.Manage);
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to view deleted pages');
    }
  }

  // Build filter
  const filters: string[] = [];
  if (typeof search === 'string' && search.trim()) {
    const sanitized = search.replace(/["%\\]/g, '');
    filters.push(`(title ~ "${sanitized}" || slug ~ "${sanitized}")`);
  }
  if (isPublished !== undefined) filters.push(`isPublished = ${isPublished === 'true' ? 'true' : 'false'}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${isDeleted === 'true' ? 'true' : 'false'}`);

  const result = await markdownService.getAllFiltered({
    sort: sort as string,
    order: order as 'asc' | 'desc',
    filter: filters.length > 0 ? filters.join(' && ') : undefined
  });

  res.json({ success: true, data: result });
};

/**
 * GET /markdown-pages/:id - Get page by ID
 */
export const getById = async (req: Request, res: Response, _next: NextFunction) => {
  const page = await markdownService.getById(req.params['id'] as string);
  res.json({ success: true, data: page });
};

/**
 * POST /markdown-pages - Create page
 */
export const create = async (req: Request, res: Response, _next: NextFunction) => {
  const { slug, parentId } = req.body as { slug: string; parentId?: string };

  // Validate reserved slugs
  if (markdownService.isReservedSlug(slug)) {
    res.status(400).json({ success: false, message: 'Slug is reserved', code: 'SLUG_RESERVED' });
    return;
  }

  // Validate uniqueness
  const isUnique = await markdownService.validateSlug(slug);
  if (!isUnique) {
    res.status(400).json({ success: false, message: 'Slug already exists', code: 'SLUG_DUPLICATE' });
    return;
  }

  // Validate menu depth
  try {
    await markdownService.validateMenuDepth(parentId);
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Invalid menu hierarchy', 
      code: 'MENU_DEPTH_EXCEEDED' 
    });
    return;
  }

  const page = await markdownService.create(req.body as MarkdownPageCreateInput, req.user?.id);
  res.status(201).json({ success: true, data: page });
};

/**
 * PUT /markdown-pages/:id - Update page
 */
export const update = async (req: Request, res: Response, _next: NextFunction) => {
  const id = req.params.id as string;
  const { slug, parentId } = req.body as { slug?: string; parentId?: string };

  if (slug) {
    if (markdownService.isReservedSlug(slug)) {
      res.status(400).json({ success: false, message: 'Slug is reserved', code: 'SLUG_RESERVED' });
      return;
    }
    const isUnique = await markdownService.validateSlug(slug, id);
    if (!isUnique) {
      res.status(400).json({ success: false, message: 'Slug already exists', code: 'SLUG_DUPLICATE' });
      return;
    }
  }

  if (parentId !== undefined) {
    try {
      await markdownService.validateMenuDepth(parentId);
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Invalid menu hierarchy', 
        code: 'MENU_DEPTH_EXCEEDED' 
      });
      return;
    }
  }

  const page = await markdownService.update(id, req.body as MarkdownPageUpdateInput, req.user?.id);
  res.json({ success: true, data: page });
};

/**
 * DELETE /markdown-pages/:id - Delete page (Soft or Hard)
 */
export const remove = async (req: Request, res: Response, _next: NextFunction) => {
  const id = req.params['id'] as string;
  const page = await markdownService.getById(id);

  if (page.isDeleted) {
    await markdownService.hardDelete(id, req.user?.id);
  } else {
    await markdownService.delete(id, req.user?.id);
  }
  res.status(204).send();
};

/**
 * POST /markdown-pages/:id/restore - Restore page
 */
export const restore = async (req: Request, res: Response, _next: NextFunction) => {
  await markdownService.restore(req.params['id'] as string, req.user?.id);
  res.status(200).json({ success: true });
};

/**
 * POST /markdown-pages/batch-delete
 */
export const batchDelete = async (req: Request, res: Response, _next: NextFunction) => {
  const { ids } = req.body as { ids: string[] };
  
  await Promise.all(ids.map(async (id) => {
    try {
      const page = await markdownService.getById(id);
      if (page.isDeleted) {
        await markdownService.hardDelete(id, req.user?.id);
      } else {
        await markdownService.delete(id, req.user?.id);
      }
    } catch (error) {
      logger.warn('MarkdownController', `Batch delete failed for ${id}`, { error });
    }
  }));
  res.status(204).send();
};

/**
 * POST /markdown-pages/batch-status
 */
export const batchUpdateStatus = async (req: Request, res: Response, _next: NextFunction) => {
  const { ids, isActive } = req.body as { ids: string[]; isActive: boolean };
  // Mapping isActive to isPublished
  await markdownService.updateMany(ids, { isPublished: isActive }, req.user?.id);
  res.status(200).json({ success: true });
};

/**
 * POST /markdown-pages/batch-restore
 */
export const batchRestore = async (req: Request, res: Response, _next: NextFunction) => {
  const { ids } = req.body as { ids: string[] };
  await markdownService.restoreMany(ids, req.user?.id);
  res.status(200).json({ success: true });
};
