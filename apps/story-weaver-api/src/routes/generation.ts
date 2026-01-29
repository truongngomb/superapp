/**
 * AI Generation Routes
 * 
 * High-level orchestration endpoints for project-wide AI tasks.
 */
import { Router } from 'express';
import { 
  requireAuth, 
  asyncHandler 
} from '../middleware/index.js';
import * as generationController from '../controllers/generation.controller.js';

export const generationRouter: Router = Router();

// Apply authentication
generationRouter.use(requireAuth);

/** POST /extract-characters/:projectId - Analyze story and suggest characters */
generationRouter.post(
  '/extract-characters/:projectId',
  asyncHandler(generationController.extractCharacters)
);

/** POST /generate-scenes/:projectId - Generate complete script and scenes from story */
generationRouter.post(
  '/generate-scenes/:projectId',
  asyncHandler(generationController.generateScenes)
);

/** POST /generate-images/:sceneId - Generate visual keyframes for a scene */
generationRouter.post(
  '/generate-images/:sceneId',
  asyncHandler(generationController.generateKeyframes)
);
