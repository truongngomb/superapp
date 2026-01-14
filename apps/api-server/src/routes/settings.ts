/**
 * Settings Router
 */
import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router: Router = Router();

// Public settings route (no auth required - for UI/UX settings like theme, layout)
router.get('/public', SettingsController.getPublic.bind(SettingsController));

// Admin routes (require admin privileges)
router.get('/', requireAdmin, SettingsController.getAll.bind(SettingsController));
router.get('/:key', requireAdmin, SettingsController.getByKey.bind(SettingsController));
router.post('/', requireAdmin, SettingsController.set.bind(SettingsController));

export const settingsRouter = router;

