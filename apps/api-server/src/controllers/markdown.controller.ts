/**
 * Markdown Pages Controller
 * Handles HTTP requests for markdown page operations.
 */
import { Request, Response, NextFunction } from 'express';
import { markdownService } from '../services/markdown.service.js';
import { translationService } from '../services/translation.service.js';
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
  const { page, limit, sort, order, isPublished, showInMenu, isDeleted } = req.query;

  // Security: Restricted access to trashed items
  if (isDeleted === 'true') {
    const canManage = hasPermission(req.user?.permissions || {}, PermissionResource.MarkdownPages, PermissionAction.Manage);
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to view deleted pages');
    }
  }

  // Build filter
  const filters: string[] = [];
  // Note: title and slug are in translations JSON, not searchable via PocketBase filter
  // Search functionality would need to be implemented differently (e.g., client-side or full-text search)
  
  if (isPublished !== undefined) filters.push(`isPublished = ${isPublished === 'true' ? 'true' : 'false'}`);
  if (showInMenu !== undefined) filters.push(`showInMenu = ${showInMenu === 'true' ? 'true' : 'false'}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${isDeleted === 'true' ? 'true' : 'false'}`);

  // Map sort field - title is in translations, use created instead
  let sortField = sort as string;
  if (sortField === 'title' || !sortField) {
    sortField = 'created'; // Default to created date
  }

  const result = await markdownService.getPage({
    page: typeof page === 'string' ? parseInt(page, 10) : undefined,
    limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
    sort: sortField,
    order: order as 'asc' | 'desc',
    filter: filters.length > 0 ? filters.join(' && ') : undefined
  });

  res.json({ success: true, data: result });
};

/**
 * GET /markdown-pages/export - Get all pages for export
 */
export const getAllForExport = async (req: Request, res: Response, _next: NextFunction) => {
  const { sort, order, isPublished, isDeleted } = req.query;

  // Security
  if (isDeleted === 'true') {
    const canManage = hasPermission(req.user?.permissions || {}, PermissionResource.MarkdownPages, PermissionAction.Manage);
    if (!canManage) {
      throw new ForbiddenError('You do not have permission to view deleted pages');
    }
  }

  // Build filter
  const filters: string[] = [];
  // Note: title and slug are in translations JSON, not searchable via PocketBase filter
  
  if (isPublished !== undefined) filters.push(`isPublished = ${isPublished === 'true' ? 'true' : 'false'}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${isDeleted === 'true' ? 'true' : 'false'}`);

  // Map sort field
  let sortField = sort as string;
  if (sortField === 'title' || !sortField) {
    sortField = 'created';
  }

  const result = await markdownService.getAllFiltered({
    sort: sortField,
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
  const { translations, parentId } = req.body as MarkdownPageCreateInput;

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

  // Validate translations (slug uniqueness and reserved words)
  try {
    const isUnique = await markdownService.validateSlug(translations);
    if (!isUnique) {
      res.status(400).json({ success: false, message: 'Slug already exists in one of the languages', code: 'SLUG_DUPLICATE' });
      return;
    }
  } catch (error) {
    // Catch reserved slug error or other validation errors
    res.status(400).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Validation failed', 
      code: 'VALIDATION_ERROR' 
    });
    return;
  }

  // Handle file upload if present
  let data: MarkdownPageCreateInput | FormData = req.body as MarkdownPageCreateInput;
  
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const formData = new FormData();
    
    // Add all body fields
    Object.entries(req.body as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'translations') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'string' || typeof value === 'number') {
          formData.append(key, String(value));
        }
      }
    });
    
    // Add files
    for (const file of req.files) {
      // Convert Buffer to Uint8Array for Blob compatibility
      const uint8Array = new Uint8Array(file.buffer);
      const blob = new Blob([uint8Array], { type: file.mimetype });
      formData.append(file.fieldname, blob, file.originalname);
    }
    
    data = formData as unknown as MarkdownPageCreateInput;
  }

  const page = await markdownService.create(data, req.user?.id);
  res.status(201).json({ success: true, data: page });
};

/**
 * PUT /markdown-pages/:id - Update page
 */
export const update = async (req: Request, res: Response, _next: NextFunction) => {
  const id = req.params.id as string;
  const { translations, parentId } = req.body as MarkdownPageUpdateInput;

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

  if (translations) {
    try {
      // Validate slugs in translations
      const isUnique = await markdownService.validateSlug(translations, id);
      if (!isUnique) {
        res.status(400).json({ success: false, message: 'Slug already exists in one of the languages', code: 'SLUG_DUPLICATE' });
        return;
      }
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Validation failed', 
        code: 'VALIDATION_ERROR' 
      });
      return;
    }
  }

  // Handle file upload if present
  let data: MarkdownPageUpdateInput | FormData = req.body as MarkdownPageUpdateInput;
  
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const formData = new FormData();
    
    // Add all body fields
    Object.entries(req.body as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'translations') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value ? 'true' : 'false');
        } else if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'string' || typeof value === 'number') {
          formData.append(key, String(value));
        }
      }
    });
    
    // Add files
    for (const file of req.files) {
      // Convert Buffer to Uint8Array for Blob compatibility
      const uint8Array = new Uint8Array(file.buffer);
      const blob = new Blob([uint8Array], { type: file.mimetype });
      formData.append(file.fieldname, blob, file.originalname);
    }
    
    data = formData as unknown as MarkdownPageUpdateInput;
  }

  const page = await markdownService.update(id, data, req.user?.id);
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

/**
 * POST /markdown-pages/translate - Auto-translate content
 * Body: { title, slug, content, excerpt, menuTitle, fromLang, toLang }
 */
export const translateContent = async (req: Request, res: Response, _next: NextFunction) => {
  const body = req.body as {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    menuTitle?: string;
    fromLang?: string;
    toLang?: string;
  };

  const { title, slug, content, excerpt, menuTitle, fromLang, toLang } = body;

  if (!title || !fromLang || !toLang) {
    res.status(400).json({ 
      success: false, 
      message: 'Missing required fields: title, fromLang, toLang' 
    });
    return;
  }

  // Validate language codes
  const validLangs = ['en', 'vi', 'ko'];
  if (!validLangs.includes(fromLang) || !validLangs.includes(toLang)) {
    res.status(400).json({ 
      success: false, 
      message: 'Invalid language code. Must be one of: en, vi, ko' 
    });
    return;
  }

  try {
    const translatedFields = await translationService.translateFields(
      {
        title,
        slug: slug || '',
        content: content || '',
        ...(excerpt && { excerpt }),
        ...(menuTitle && { menuTitle }),
      },
      fromLang as 'en' | 'vi' | 'ko',
      toLang as 'en' | 'vi' | 'ko'
    );

    res.json({ success: true, data: translatedFields });
  } catch (error) {
    logger.error('MarkdownController', 'Translation failed', { error });
    res.status(500).json({ 
      success: false, 
      message: 'Translation service error' 
    });
  }
};
