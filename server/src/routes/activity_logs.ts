/**
 * Activity Logs Routes
 * 
 * RESTful endpoints for activity log viewing.
 */
import { Router } from 'express';
import { asyncHandler, authenticate, requirePermission } from '../middleware/index.js';
import { activityLogController } from '../controllers/index.js';
import { Resources, Actions } from '../types/index.js';

export const activityLogsRouter = Router();

// =============================================================================
// Protected Routes (require authentication + permission)
// =============================================================================

/** GET /activity-logs - List all activity logs (Admin only) */
activityLogsRouter.get(
  '/',
  authenticate,
  requirePermission(Resources.ACTIVITY_LOGS, Actions.VIEW),
  asyncHandler(activityLogController.getAll)
);
