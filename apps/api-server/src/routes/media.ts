/**
 * Media Routes
 */
import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';

export const mediaRouter: Router = Router();

mediaRouter.get('/', mediaController.list);
mediaRouter.post('/upload', mediaController.upload);
mediaRouter.delete('/:id', mediaController.delete);
