import { Router } from 'express';
import { getSystemStats } from '../controllers/system.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/stats', requireAdmin, getSystemStats);

export default router;
