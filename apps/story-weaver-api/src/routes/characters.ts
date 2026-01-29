/**
 * Characters Routes
 */
import { Router } from 'express';
import { 
  requireAuth, 
  validateBody, 
  asyncHandler 
} from '../middleware/index.js';
import * as characterController from '../controllers/character.controller.js';
import * as generationController from '../controllers/generation.controller.js';
import { CharacterCreateSchema, CharacterUpdateSchema } from '../schemas/index.js';

export const charactersRouter: Router = Router();

// Apply authentication to all routes
charactersRouter.use(requireAuth);

/** GET /projects/:projectId/characters - List characters for a project */
charactersRouter.get(
  '/by-project/:projectId', 
  asyncHandler(characterController.getByProject)
);

/** GET /:id - Get character details */
charactersRouter.get(
  '/:id', 
  asyncHandler(characterController.getById)
);

/** POST / - Create new character */
charactersRouter.post(
  '/',
  validateBody(CharacterCreateSchema),
  asyncHandler(characterController.create)
);

/** PUT /:id - Update character */
charactersRouter.put(
  '/:id',
  validateBody(CharacterUpdateSchema),
  asyncHandler(characterController.update)
);

/** DELETE /:id - Delete character */
charactersRouter.delete(
  '/:id', 
  asyncHandler(characterController.remove)
);

/** POST /:characterId/generate-portraits - Trigger AI portrait generation */
charactersRouter.post(
  '/:characterId/generate-portraits',
  asyncHandler(generationController.generatePortraits)
);
