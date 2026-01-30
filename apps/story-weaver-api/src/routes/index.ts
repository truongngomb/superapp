import { Router } from 'express';
import { videoProjectsRouter } from './video-projects.js';
import { charactersRouter } from './characters.js';
import { scenesRouter } from './scenes.js';
import { generationRouter } from './generation.js';
import { artStylesRouter } from './features.js';

export const apiRouter: Router = Router();

apiRouter.use('/video-projects', videoProjectsRouter);
apiRouter.use('/characters', charactersRouter);
apiRouter.use('/scenes', scenesRouter);
apiRouter.use('/generation', generationRouter);
apiRouter.use('/features', artStylesRouter);
