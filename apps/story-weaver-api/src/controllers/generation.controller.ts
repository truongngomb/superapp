/**
 * Generation Controller
 * 
 * Handles AI generation requests for characters, scripts, and images.
 */
import { Request, Response } from 'express';
import { 
  scriptService, 
  imageGenService, 
  videoProjectService,
  characterService,
  videoSceneService,
  motionGenService,
  renderingService
} from '../services/index.js';

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
 * POST /projects/:projectId/extract-characters
 */
export const extractCharacters = async (req: Request, res: Response) => {
  const projectId = req.params['projectId'] as string;
  await verifyProjectOwnership(projectId, req.user?.id);

  const suggestions = await scriptService.extractCharacters(projectId);
  res.json({ success: true, data: suggestions });
};

/**
 * POST /projects/:projectId/generate-scenes
 */
export const generateScenes = async (req: Request, res: Response) => {
  const projectId = req.params['projectId'] as string;
  await verifyProjectOwnership(projectId, req.user?.id);

  const scenes = await scriptService.generateScenes(projectId);
  res.json({ success: true, data: scenes });
};

/**
 * POST /characters/:characterId/generate-portraits
 */
export const generatePortraits = async (req: Request, res: Response) => {
  const characterId = req.params['characterId'] as string;
  const character = await characterService.getById(characterId);
  await verifyProjectOwnership(character.projectId, req.user?.id);

  const options = await imageGenService.generateCharacterPortraits(characterId);
  res.json({ success: true, data: options });
};

/**
 * POST /scenes/:sceneId/generate-keyframes
 */
export const generateKeyframes = async (req: Request, res: Response) => {
  const sceneId = req.params['sceneId'] as string;
  const scene = await videoSceneService.getById(sceneId);
  await verifyProjectOwnership(scene.projectId, req.user?.id);

  const options = await imageGenService.generateSceneKeyframes(sceneId);
  res.json({ success: true, data: options });
};

/**
 * POST /scenes/:sceneId/generate-motion
 */
export const generateMotion = async (req: Request, res: Response) => {
  const sceneId = req.params['sceneId'] as string;
  const scene = await videoSceneService.getById(sceneId);
  await verifyProjectOwnership(scene.projectId, req.user?.id);

  const result = await motionGenService.generateSceneMotion(sceneId);
  res.json({ success: true, data: result });
};

/**
 * POST /projects/:projectId/render
 */
export const renderVideo = async (req: Request, res: Response) => {
  const projectId = req.params['projectId'] as string;
  await verifyProjectOwnership(projectId, req.user?.id);

  const result = await renderingService.renderProject(projectId);
  res.json({ success: true, data: result });
};


