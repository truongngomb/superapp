import { Router } from 'express';
import { getSystemStats, pruneLogs, clearCache } from '../controllers/system.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/stats', requireAdmin, getSystemStats);
router.post('/logs/prune', requireAdmin, pruneLogs);
router.post('/cache/clear', requireAdmin, clearCache);

export default router;
