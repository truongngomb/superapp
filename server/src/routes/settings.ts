/**
 * Settings Router
 */
import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// All settings routes require admin privileges
router.use(requireAdmin);

// Get all settings
router.get('/', SettingsController.getAll.bind(SettingsController));

// Get setting by key
router.get('/:key', SettingsController.getByKey.bind(SettingsController));

// Set/Update setting
router.post('/', SettingsController.set.bind(SettingsController));

export const settingsRouter = router;
