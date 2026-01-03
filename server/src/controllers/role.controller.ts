/**
 * Role Controller
 * 
 * Handles HTTP requests for role operations.
 */
import { Request, Response } from 'express';
import { roleService } from '../services/index.js';
import { RoleCreateInput, RoleUpdateInput } from '../types/index.js';

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /roles - Get paginated roles
 */
export const getAll = async (req: Request, res: Response) => {
  const { page, limit, sort, order, search, isActive } = req.query;
  
  // Build filter string for PocketBase
  const filters: string[] = [];
  if (typeof search === 'string') filters.push(`(name ~ "${search}" || description ~ "${search}")`);
  if (isActive !== undefined) filters.push(`isActive = ${isActive === 'true' ? 'true' : 'false'}`);
  
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
  await roleService.delete(req.params['id'] as string, req.user?.id);
  res.status(204).send();
};
