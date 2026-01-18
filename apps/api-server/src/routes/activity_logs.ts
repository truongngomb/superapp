/**
 * Activity Logs Routes
 * 
 * RESTful endpoints for activity log viewing.
 */
import express from 'express';
import { asyncHandler, authenticate, requirePermission } from '../middleware/index.js';
import * as activityLogController from '../controllers/activity_log.controller.js';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';


export const activityLogsRouter: express.Router = express.Router();

// =============================================================================
// Protected Routes (require authentication + permission)
// =============================================================================

/** GET /activity-logs/export - Get all activity logs for export (no pagination) */
activityLogsRouter.get(
  '/export',
  authenticate,
  requirePermission(PermissionResource.ActivityLogs, PermissionAction.View),

  asyncHandler(activityLogController.getAllForExport)
);

/** GET /activity-logs - List all activity logs (Admin only) */
activityLogsRouter.get(
  '/',
  authenticate,
  requirePermission(PermissionResource.ActivityLogs, PermissionAction.View),

  asyncHandler(activityLogController.getAll)
);
