import { Request, Response } from 'express';
import * as categoryService from '../services/categoryService.js';
import { ValidationError } from '../middleware/index.js';
import { CategoryInput } from '../types/index.js';

export const getAll = async (_req: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.json(categories);
};

export const getById = async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryById(req.params['id'] ?? '');
  res.json(category);
};

export const create = async (req: Request, res: Response) => {
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
};

export const update = async (req: Request, res: Response) => {
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
};

export const remove = async (req: Request, res: Response) => {
  await categoryService.deleteCategory(req.params['id'] ?? '');
  res.status(204).send();
};
