/**
 * Role Controller
 * 
 * Handles HTTP requests for role operations.
 */
import { Request, Response } from 'express';
import { roleService } from '../services/index.js';
import { RoleCreateInput, RoleUpdateInput, Resources, Actions } from '../types/index.js';
import { hasPermission, ForbiddenError } from '../middleware/index.js';
import { logger } from '../utils/index.js';

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /roles - Get paginated roles
 */
export const getAll = async (req: Request, res: Response) => {
  const { page, limit, sort, order, search, isActive, isDeleted } = req.query;

  // Security: Restricted access to trashed items (isDeleted=true)
  if (isDeleted === 'true') {
     const canManage = hasPermission(req.user?.permissions || {}, Resources.ROLES, Actions.MANAGE);
     if (!canManage) {
       throw new ForbiddenError('You do not have permission to view deleted roles');
     }
  }
  
  // Build filter string for PocketBase
  const filters: string[] = [];
  if (typeof search === 'string') filters.push(`(name ~ "${search}" || description ~ "${search}")`);
  if (isActive !== undefined) filters.push(`isActive = ${isActive === 'true' ? 'true' : 'false'}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${isDeleted === 'true' ? 'true' : 'false'}`);
  
  const result = await roleService.getPage({
    page: typeof page === 'string' ? parseInt(page, 10) : undefined,
    limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
    sort: sort as string,
    order: order as 'asc' | 'desc',
    filter: filters.length > 0 ? filters.join(' && ') : undefined
  });
  
  res.json({ success: true, data: result });
};

/**
 * GET /roles/:id - Get role by ID
 */
export const getById = async (req: Request, res: Response) => {
  const role = await roleService.getById(req.params['id'] as string);
  res.json({ success: true, data: role });
};

/**
 * POST /roles - Create new role
 */
export const create = async (req: Request, res: Response) => {
  // Body is already validated by middleware (validateBody)
  const role = await roleService.create(req.body as RoleCreateInput, req.user?.id);
  res.status(201).json({ success: true, data: role });
};

/**
 * PUT /roles/:id - Update role
 */
export const update = async (req: Request, res: Response) => {
  const role = await roleService.update(
    req.params['id'] as string,
    req.body as RoleUpdateInput,
    req.user?.id
  );
  res.json({ success: true, data: role });
};

/**
 * DELETE /roles/:id - Delete role
 */
export const remove = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const role = await roleService.getById(id);
  
  if (role.isDeleted) {
    await roleService.hardDelete(id, req.user?.id);
  } else {
    await roleService.delete(id, req.user?.id);
  }
  
  res.status(204).send();
};

/**
 * POST /roles/:id/restore - Restore soft-deleted role
 */
export const restore = async (req: Request, res: Response) => {
  await roleService.restore(req.params['id'] as string, req.user?.id);
  res.status(200).json({ success: true });
};

/**
 * POST /roles/batch-delete - Batch delete roles
 */
export const batchDelete = async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: string[] };
  
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ success: false, message: 'No IDs provided' });
    return;
  }

  // To handle mixed hard/soft delete in batch, we need to check each one
  await Promise.all(ids.map(async (id: string) => {
    try {
      const role = await roleService.getById(id);
      if (role.isDeleted) {
        await roleService.hardDelete(id, req.user?.id);
      } else {
        await roleService.delete(id, req.user?.id);
      }
    } catch (err) {
      logger.warn(`Failed to delete role ${id}`, err instanceof Error ? err.message : String(err));
    }
  }));

  res.status(204).send();
};

/**
 * POST /roles/batch-status - Batch update status
 */
export const batchUpdateStatus = async (req: Request, res: Response) => {
  const { ids, isActive } = req.body as { ids: string[]; isActive: unknown };

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ success: false, message: 'No IDs provided' });
    return;
  }

  if (typeof isActive !== 'boolean') {
    res.status(400).json({ success: false, message: 'Invalid status provided' });
    return;
  }

  await roleService.updateStatusMany(ids, isActive, req.user?.id);
  res.status(200).json({ success: true });
};

/**
 * POST /roles/batch-restore - Batch restore roles
 */
export const batchRestore = async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: string[] };

  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ success: false, message: 'No IDs provided' });
    return;
  }

  await roleService.restoreMany(ids, req.user?.id);
  res.status(200).json({ success: true });
};

/**
 * GET /roles/export - Get all roles for export
 */
export const getAllForExport = async (req: Request, res: Response) => {
  const { search, isActive, sort, order, isDeleted } = req.query;

  // Build filter string
  const filters: string[] = [];
  if (typeof search === 'string') filters.push(`(name ~ "${search}" || description ~ "${search}")`);
  if (isActive !== undefined) filters.push(`isActive = ${isActive === 'true' ? 'true' : 'false'}`);
  
  // Handle soft delete filter
  if (isDeleted === 'true') {
     // Show only deleted items
     filters.push('isDeleted = true');
  } else {
     // Show only active items (default behavior)
     filters.push('isDeleted = false');
  }

  const result = await roleService.getAllFiltered({
    sort: sort as string || 'created',
    order: (order as 'asc' | 'desc' | undefined) || 'desc',
    filter: filters.length > 0 ? filters.join(' && ') : undefined
  });

  res.json({ success: true, data: result });
};
