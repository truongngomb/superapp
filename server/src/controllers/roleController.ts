/**
 * Role Controller
 * 
 * Handles HTTP requests for role operations.
 */
import { Request, Response } from 'express';
import { roleService } from '../services/index.js';

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /roles - Get all roles
 */
export const getAll = async (_req: Request, res: Response) => {
  const roles = await roleService.getAll();
  res.json({ success: true, data: roles });
};

/**
 * GET /roles/:id - Get role by ID
 */
export const getById = async (req: Request, res: Response) => {
  const role = await roleService.getById(req.params['id'] ?? '');
  res.json({ success: true, data: role });
};

/**
 * POST /roles - Create new role
 */
export const create = async (req: Request, res: Response) => {
  // Body is already validated by middleware (validateBody)
  const role = await roleService.create(req.body);
  res.status(201).json({ success: true, data: role });
};

/**
 * PUT /roles/:id - Update role
 */
export const update = async (req: Request, res: Response) => {
  const role = await roleService.update(req.params['id'] ?? '', req.body);
  res.json({ success: true, data: role });
};

/**
 * DELETE /roles/:id - Delete role
 */
export const remove = async (req: Request, res: Response) => {
  await roleService.delete(req.params['id'] ?? '');
  res.status(204).send();
};
