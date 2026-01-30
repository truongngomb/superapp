import { Router } from 'express';
import { ART_STYLES } from '../config/art-styles.config.js';

export const artStylesRouter: Router = Router();

/**
 * GET /api/story-weaver/features/art-styles
 * Get list of available Art Styles
 */
artStylesRouter.get('/art-styles', (_req, res) => {
  res.json({
    success: true,
    data: ART_STYLES
  });
});
