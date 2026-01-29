/**
 * Character Controller
 * 
 * Handles HTTP requests for character operations.
 */
import { Request, Response } from 'express';
import { characterService, videoProjectService } from '../services/index.js';
import { CreateCharacterInput, UpdateCharacterInput } from '../types/index.js';

/**
 * Helper to verify project ownership
 */
async function verifyProjectOwnership(projectId: string, userId?: string) {
  const project = await videoProjectService.getById(projectId);
  if (project.userId !== userId) {
    throw { status: 404, message: 'Project not found' };
  }
  return project;
}

/**
 * GET /projects/:projectId/characters - Get characters for a project
 */
export const getByProject = async (req: Request, res: Response) => {
  const projectId = req.params['projectId'] as string;
  const { page, limit, sort, order, status } = req.query;

  await verifyProjectOwnership(projectId, req.user?.id);

  const filters: string[] = [`project_id = "${projectId}"`];
  if (typeof status === 'string' && status.trim()) {
    filters.push(`status = "${status}"`);
  }

  const result = await characterService.getPage({
    page: typeof page === 'string' ? parseInt(page, 10) : undefined,
    limit: typeof limit === 'string' ? parseInt(limit, 10) : undefined,
    sort: sort as string,
    order: order as 'asc' | 'desc',
    filter: filters.join(' && ')
  });

  res.json({ success: true, data: result });
};

/**
 * GET /characters/:id - Get character by ID
 */
export const getById = async (req: Request, res: Response) => {
  const character = await characterService.getById(req.params['id'] as string);
  await verifyProjectOwnership(character.projectId, req.user?.id);
  res.json({ success: true, data: character });
};

/**
 * POST /characters - Create new character
 */
export const create = async (req: Request, res: Response) => {
  const input = req.body as CreateCharacterInput;
  await verifyProjectOwnership(input.projectId, req.user?.id);

  const character = await characterService.create({
    ...input,
    userId: req.user?.id,
    status: 'draft',
    version: 1,
  }, req.user?.id);

  res.status(201).json({ success: true, data: character });
};

/**
 * PUT /characters/:id - Update character
 */
export const update = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const input = req.body as UpdateCharacterInput;

  const existing = await characterService.getById(id);
  await verifyProjectOwnership(existing.projectId, req.user?.id);

  const character = await characterService.update(id, input, req.user?.id);
  res.json({ success: true, data: character });
};

/**
 * DELETE /characters/:id - Soft delete character
 */
export const remove = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const existing = await characterService.getById(id);
  await verifyProjectOwnership(existing.projectId, req.user?.id);

  await characterService.delete(id, req.user?.id);
  res.status(204).send();
};
