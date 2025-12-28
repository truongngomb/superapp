import { Router } from 'express';
import { asyncHandler } from '../middleware/index.js';
import { roleController } from '../controllers/index.js';

export const rolesRouter = Router();

rolesRouter.get('/', asyncHandler(roleController.getAll));
rolesRouter.get('/:id', asyncHandler(roleController.getById));
rolesRouter.post('/', asyncHandler(roleController.create));
rolesRouter.put('/:id', asyncHandler(roleController.update));
rolesRouter.delete('/:id', asyncHandler(roleController.remove));
