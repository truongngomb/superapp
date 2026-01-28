/**
 * Video Projects Routes
 * 
 * RESTful endpoints for video project management.
 */
import { Router } from 'express';
import { 
  requireAuth, 
  validateBody, 
  asyncHandler 
} from '../middleware/index.js';
import * as videoProjectController from '../controllers/video-project.controller.js';
import { 
  VideoProjectCreateSchema, 
  VideoProjectUpdateSchema 
} from '../schemas/index.js';

export const videoProjectsRouter: Router = Router();

// =============================================================================
// Routes
// =============================================================================

// Apply authentication to all routes
videoProjectsRouter.use(requireAuth);

/** GET / - List all projects (paginated) */
videoProjectsRouter.get(
  '/', 
  asyncHandler(videoProjectController.getAll)
);

/** GET /:id - Get project details */
videoProjectsRouter.get(
  '/:id', 
  asyncHandler(videoProjectController.getById)
);

/** POST / - Create new project */
videoProjectsRouter.post(
  '/',
  validateBody(VideoProjectCreateSchema),
  asyncHandler(videoProjectController.create)
);

/** PUT /:id - Update project */
videoProjectsRouter.put(
  '/:id',
  validateBody(VideoProjectUpdateSchema),
  asyncHandler(videoProjectController.update)
);

/** DELETE /:id - Soft delete project */
videoProjectsRouter.delete(
  '/:id', 
  asyncHandler(videoProjectController.remove)
);

/** POST /:id/restore - Restore soft-deleted project */
videoProjectsRouter.post(
  '/:id/restore',
  asyncHandler(videoProjectController.restore)
);
