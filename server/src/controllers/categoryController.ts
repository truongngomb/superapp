/**
 * Category Controller
 * 
 * Handles HTTP requests for category operations.
 */
import { Request, Response } from 'express';
import { categoryService } from '../services/index.js';

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /categories - Get all categories
 */
export const getAll = async (_req: Request, res: Response) => {
  const categories = await categoryService.getAll();
  res.json({ success: true, data: categories });
};

/**
 * GET /categories/:id - Get category by ID
 */
export const getById = async (req: Request, res: Response) => {
  const category = await categoryService.getById(req.params['id'] ?? '');
  res.json({ success: true, data: category });
};

/**
 * POST /categories - Create new category
 */
export const create = async (req: Request, res: Response) => {
  // Body is already validated by middleware (validateBody)
  const category = await categoryService.create(req.body);
  res.status(201).json({ success: true, data: category });
};

/**
 * PUT /categories/:id - Update category
 */
export const update = async (req: Request, res: Response) => {
  const category = await categoryService.update(req.params['id'] ?? '', req.body);
  res.json({ success: true, data: category });
};

/**
 * DELETE /categories/:id - Delete category
 */
export const remove = async (req: Request, res: Response) => {
  await categoryService.delete(req.params['id'] ?? '');
  res.status(204).send();
};
