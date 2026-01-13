import { Router } from 'express';
import { 
  getSystemStats, 
  pruneLogs, 
  clearCache,
  getBackups,
  createBackup,
  restoreBackup,
  deleteBackup
} from '../controllers/system.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router: Router = Router();

router.get('/stats', requireAdmin, getSystemStats);
router.post('/logs/prune', requireAdmin, pruneLogs);
router.post('/cache/clear', requireAdmin, clearCache);

// Backup Routes
router.get('/backups', requireAdmin, getBackups);
router.post('/backups', requireAdmin, createBackup);
router.post('/backups/:key/restore', requireAdmin, restoreBackup);
router.delete('/backups/:key', requireAdmin, deleteBackup);

export default router;
