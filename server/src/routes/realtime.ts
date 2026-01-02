import { Router } from 'express';
import * as realtimeController from '../controllers/realtime.controller.js';
import { authenticate, requireAuth } from '../middleware/index.js';

const router = Router();

/**
 * SSE endpoint for real-time events
 * Protected by authentication
 */
router.get('/events', authenticate, requireAuth, realtimeController.getEvents);

export const realtimeRouter = router;
