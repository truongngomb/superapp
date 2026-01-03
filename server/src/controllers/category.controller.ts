/**
 * Category Controller
 * 
 * Handles HTTP requests for category operations.
 */
import { Request, Response } from 'express';
import { categoryService } from '../services/index.js';
import { CategoryCreateInput, CategoryUpdateInput } from '../types/index.js';

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /categories - Get paginated categories
 */
export const getAll = async (req: Request, res: Response) => {
  const { page, limit, sort, order, search, color, isActive } = req.query;
  
  // Build filter string for PocketBase
  const filters: string[] = [];
  if (typeof search === 'string') filters.push(`(name ~ "${search}" || description ~ "${search}")`);
  if (typeof color === 'string') filters.push(`color = "${color}"`);
  if (isActive !== undefined) filters.push(`isActive = ${isActive === 'true' ? 'true' : 'false'}`);
  
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
 * GET /categories/:id - Get category by ID
 */
export const getById = async (req: Request, res: Response) => {
  const category = await categoryService.getById(req.params['id'] as string);
  res.json({ success: true, data: category });
};

/**
 * POST /categories - Create new category
 */
export const create = async (req: Request, res: Response) => {
  // Body is already validated by middleware (validateBody)
  const category = await categoryService.create(req.body as CategoryCreateInput, req.user?.id);
  res.status(201).json({ success: true, data: category });
};

/**
 * PUT /categories/:id - Update category
 */
export const update = async (req: Request, res: Response) => {
  const category = await categoryService.update(
    req.params['id'] as string,
    req.body as CategoryUpdateInput,
    req.user?.id
  );
  res.json({ success: true, data: category });
};

/**
 * DELETE /categories/:id - Delete category
 */
export const remove = async (req: Request, res: Response) => {
  await categoryService.delete(req.params['id'] as string, req.user?.id);
  res.status(204).send();
};
