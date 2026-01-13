/**
 * Settings Controller
 */
import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service.js';
import { createLogger } from '../utils/index.js';

const log = createLogger('SettingsController');

/**
 * Settings Controller
 */
export const SettingsController = {
  /**
   * Get all settings
   */
  async getAll(_req: Request, res: Response) {
    try {
      const settings = await SettingsService.getAllSettings();
      res.json(settings);
    } catch (error) {
      log.error('Error in getAll settings:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  /**
   * Get setting by key
   */
  async getByKey(req: Request, res: Response) {
    try {
      const { key } = req.params as { key: string };
      if (!key) {
        return res.status(400).json({ message: 'Key is required' });
      }
      const value = await SettingsService.getSetting(key);
      if (value === null) {
        return res.status(404).json({ message: 'Setting not found' });
      }
      res.json({ key, value });
    } catch (error) {
      log.error('Error in getByKey setting:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  /**
   * Set setting
   */
  async set(req: Request, res: Response) {
    try {
      const { key, value } = req.body as { key: string; value: unknown };
      if (!key) {
        return res.status(400).json({ message: 'Key is required' });
      }
      await SettingsService.setSetting(key, value);
      res.status(200).json({ success: true });
    } catch (error) {
      log.error('Error in set setting:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
