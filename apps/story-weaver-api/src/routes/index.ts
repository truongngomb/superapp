/**
 * Main Routes Aggregator
 */
import { Router } from 'express';
import { videoProjectsRouter } from './video-projects.js';

export const apiRouter: Router = Router();

apiRouter.use('/video-projects', videoProjectsRouter);
// Add more routes here as needed
