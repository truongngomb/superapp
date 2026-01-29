/**
 * Video Scene Controller
 */
import { Request, Response } from 'express';
import { videoSceneService, videoProjectService } from '../services/index.js';
import { CreateVideoSceneInput, UpdateVideoSceneInput } from '../types/index.js';

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
 * GET /projects/:projectId/scenes
 */
export const getByProject = async (req: Request, res: Response) => {
  const projectId = req.params['projectId'] as string;
  await verifyProjectOwnership(projectId, req.user?.id);

  const scenes = await videoSceneService.getByProject(projectId);
  res.json({ success: true, data: scenes });
};

/**
 * GET /scenes/:id
 */
export const getById = async (req: Request, res: Response) => {
  const scene = await videoSceneService.getById(req.params['id'] as string);
  await verifyProjectOwnership(scene.projectId, req.user?.id);
  res.json({ success: true, data: scene });
};

/**
 * POST /projects/:projectId/scenes
 */
export const create = async (req: Request, res: Response) => {
  const projectId = req.params['projectId'] as string;
  const input = req.body as CreateVideoSceneInput;
  await verifyProjectOwnership(projectId, req.user?.id);

  const scene = await videoSceneService.create({
    ...input,
    projectId,
    status: 'draft'
  }, req.user?.id);

  res.status(201).json({ success: true, data: scene });
};

/**
 * PUT /scenes/:id
 */
export const update = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const input = req.body as UpdateVideoSceneInput;

  const existing = await videoSceneService.getById(id);
  await verifyProjectOwnership(existing.projectId, req.user?.id);

  const scene = await videoSceneService.update(id, input, req.user?.id);
  res.json({ success: true, data: scene });
};

/**
 * DELETE /scenes/:id
 */
export const remove = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const existing = await videoSceneService.getById(id);
  await verifyProjectOwnership(existing.projectId, req.user?.id);

  await videoSceneService.delete(id, req.user?.id);
  res.status(204).send();
};
