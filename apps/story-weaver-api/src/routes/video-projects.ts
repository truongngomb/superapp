/**
 * Video Projects Routes
 */
import { Router } from 'express';
import { requireAuth } from '../middleware/index.js';
import * as videoProjectController from '../controllers/video-project.controller.js';

export const videoProjectsRouter = Router();

// All routes require authentication
videoProjectsRouter.use(requireAuth);

videoProjectsRouter.get('/', videoProjectController.getAll);
videoProjectsRouter.get('/:id', videoProjectController.getById);
videoProjectsRouter.post('/', videoProjectController.create);
videoProjectsRouter.put('/:id', videoProjectController.update);
videoProjectsRouter.delete('/:id', videoProjectController.remove);
videoProjectsRouter.post('/:id/restore', videoProjectController.restore);
