import { Request, Response } from 'express';
import * as roleService from '../services/roleService.js';
import { ValidationError } from '../middleware/index.js';
import { CreateRoleInput, UpdateRoleInput } from '../types/index.js';

/**
 * Get all roles
 */
export const getAll = async (_req: Request, res: Response) => {
  const roles = await roleService.getRoles();
  res.json(roles);
};

/**
 * Get a role by ID
 */
export const getById = async (req: Request, res: Response) => {
  const role = await roleService.getRoleById(req.params['id'] ?? '');
  res.json(role);
};

/**
 * Create a new role
 */
export const create = async (req: Request, res: Response) => {
  const input = req.body as CreateRoleInput;

  // Validation
  if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
    throw new ValidationError('Name is required');
  }

  const role = await roleService.createRole({
    name: input.name.trim(),
    description: input.description?.trim(),
    permissions: input.permissions ?? {},
  });

  res.status(201).json(role);
};

/**
 * Update an existing role
 */
export const update = async (req: Request, res: Response) => {
  const input = req.body as UpdateRoleInput;

  const role = await roleService.updateRole(req.params['id'] ?? '', {
    name: input.name?.trim(),
    description: input.description?.trim(),
    permissions: input.permissions,
  });

  res.json(role);
};

/**
 * Delete a role
 */
export const remove = async (req: Request, res: Response) => {
  await roleService.deleteRole(req.params['id'] ?? '');
  res.status(204).send();
};
