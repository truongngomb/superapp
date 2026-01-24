/**
 * Video Project Routes
 */
import { Router } from 'express';
import { asyncHandler, requirePermission, validateBody } from '../middleware/index.js';
import * as videoProjectController from '../controllers/video-project.controller.js';
import { VideoProjectCreateSchema, VideoProjectUpdateSchema } from '../schemas/index.js';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';

export const videoProjectsRouter: Router = Router();

videoProjectsRouter.get(
  '/',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.View),
  asyncHandler(videoProjectController.getAll)
);

videoProjectsRouter.get(
  '/:id',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.View),
  asyncHandler(videoProjectController.getById)
);

videoProjectsRouter.post(
  '/',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.Create),
  validateBody(VideoProjectCreateSchema),
  asyncHandler(videoProjectController.create)
);

videoProjectsRouter.post(
  '/generate-script',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.Create),
  asyncHandler(videoProjectController.generateScript)
);

videoProjectsRouter.put(
  '/:id',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.Update),
  validateBody(VideoProjectUpdateSchema),
  asyncHandler(videoProjectController.update)
);

videoProjectsRouter.post(
  '/:id/restore',
  asyncHandler(videoProjectController.restore)
);

videoProjectsRouter.post(
  '/:id/render',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.Update),
  asyncHandler(videoProjectController.renderVideo)
);

videoProjectsRouter.delete(
  '/:id',
  requirePermission(PermissionResource.VideoProjects, PermissionAction.Delete),
  asyncHandler(videoProjectController.remove)
);
