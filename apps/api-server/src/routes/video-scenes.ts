/**
 * Video Scene Routes
 */
import { Router } from 'express';
import { asyncHandler, requirePermission, validateBody } from '../middleware/index.js';
import * as videoSceneController from '../controllers/video-scene.controller.js';
import { VideoSceneCreateSchema, VideoSceneUpdateSchema } from '../schemas/index.js';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';

export const videoScenesRouter: Router = Router();

videoScenesRouter.get(
  '/',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.View),
  asyncHandler(videoSceneController.getAll)
);

videoScenesRouter.get(
  '/:id',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.View),
  asyncHandler(videoSceneController.getById)
);

videoScenesRouter.post(
  '/',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.Create),
  validateBody(VideoSceneCreateSchema),
  asyncHandler(videoSceneController.create)
);

videoScenesRouter.put(
  '/:id',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.Update),
  validateBody(VideoSceneUpdateSchema),
  asyncHandler(videoSceneController.update)
);

videoScenesRouter.post(
  '/:id/restore',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.Update),
  asyncHandler(videoSceneController.restore)
);

videoScenesRouter.delete(
  '/:id',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.Delete),
  asyncHandler(videoSceneController.remove)
);
