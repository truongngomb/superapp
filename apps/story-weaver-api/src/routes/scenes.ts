/**
 * Video Scenes Routes
 */
import { Router } from 'express';
import { 
  requireAuth, 
  validateBody, 
  asyncHandler 
} from '../middleware/index.js';
import * as sceneController from '../controllers/video-scene.controller.js';
import * as generationController from '../controllers/generation.controller.js';
import { VideoSceneCreateSchema, VideoSceneUpdateSchema } from '../schemas/index.js';

export const scenesRouter: Router = Router();

// Apply authentication to all routes
scenesRouter.use(requireAuth);

/** GET /by-project/:projectId - List scenes for a project */
scenesRouter.get(
  '/by-project/:projectId', 
  asyncHandler(sceneController.getByProject)
);

/** GET /:id - Get scene details */
scenesRouter.get(
  '/:id', 
  asyncHandler(sceneController.getById)
);

/** POST / - Create new scene (Manual) */
scenesRouter.post(
  '/:projectId',
  validateBody(VideoSceneCreateSchema),
  asyncHandler(sceneController.create)
);

/** PUT /:id - Update scene */
scenesRouter.put(
  '/:id',
  validateBody(VideoSceneUpdateSchema),
  asyncHandler(sceneController.update)
);

/** DELETE /:id - Delete scene */
scenesRouter.delete(
  '/:id', 
  asyncHandler(sceneController.remove)
);

/** POST /:sceneId/generate-keyframes - Trigger AI keyframe generation */
scenesRouter.post(
  '/:sceneId/generate-keyframes',
  asyncHandler(generationController.generateKeyframes)
);
