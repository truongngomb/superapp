import { Router } from 'express';
import { asyncHandler, ValidationError } from '../middleware/index.js';
import * as categoryService from '../services/categoryService.js';
import type { CategoryInput } from '../types/index.js';

export const categoriesRouter = Router();

/**
 * GET /api/categories
 * Get all categories
 */
categoriesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  })
);

/**
 * GET /api/categories/:id
 * Get category by ID
 */
categoriesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryById(req.params['id'] ?? '');
    res.json(category);
  })
);

/**
 * POST /api/categories
 * Create new category
 */
categoriesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = req.body as CategoryInput;

    // Validation
    if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    const category = await categoryService.createCategory({
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      color: input.color ?? '#3b82f6',
      icon: input.icon ?? 'folder',
    });

    res.status(201).json(category);
  })
);

/**
 * PUT /api/categories/:id
 * Update category
 */
categoriesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const input = req.body as CategoryInput;

    // Validation
    if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }

    const category = await categoryService.updateCategory(req.params['id'] ?? '', {
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      color: input.color ?? '#3b82f6',
      icon: input.icon ?? 'folder',
    });

    res.json(category);
  })
);

/**
 * DELETE /api/categories/:id
 * Delete category
 */
categoriesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params['id'] ?? '');
    res.status(204).send();
  })
);
