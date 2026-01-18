/**
 * Activity Log Controller
 * 
 * Handles HTTP requests for activity log operations.
 */
import { Request, Response } from 'express';
import { activityLogService } from '../services/index.js';
import { sanitizePocketBaseFilter } from '../utils/index.js';
import { hasPermission, ForbiddenError } from '../middleware/index.js';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';

// =============================================================================
// Handlers
// =============================================================================

/**
 * GET /activity-logs - Get paginated activity logs
 */
export const getAll = async (req: Request, res: Response) => {
  // Security: Check for view permission explicitly in handler (consistency with Category SSoT)
  const canView = hasPermission(req.user?.permissions || {}, PermissionResource.ActivityLogs, PermissionAction.View);

  if (!canView) {
    throw new ForbiddenError('You do not have permission to view activity logs');
  }

  const page = req.query['page'] ? Number(req.query['page']) : undefined;
  const limit = req.query['limit'] ? Number(req.query['limit']) : undefined;
  const sort = req.query['sort'] as string | undefined;
  const order = req.query['order'] as 'asc' | 'desc' | undefined;
  const search = req.query['search'] as string | undefined;

  let filter = '';
  if (search) {
    // Sanitize input to prevent PocketBase filter injection
    const sanitizedSearch = sanitizePocketBaseFilter(search);
    // Filter by message, resource, or action
    filter = `message ~ "${sanitizedSearch}" || resource ~ "${sanitizedSearch}" || action ~ "${sanitizedSearch}"`;
  }
  
  const result = await activityLogService.getPage({
    page,
    limit,
    sort,
    order,
    filter,
  });
  
  res.json({ success: true, data: result });
};

/**
 * GET /activity-logs/export - Get all activity logs for export (no pagination)
 */
export const getAllForExport = async (req: Request, res: Response) => {
  // Security: Check for view permission explicitly in handler
  const canView = hasPermission(req.user?.permissions || {}, PermissionResource.ActivityLogs, PermissionAction.View);

  if (!canView) {
    throw new ForbiddenError('You do not have permission to view activity logs');
  }

  const sort = req.query['sort'] as string | undefined;
  const order = req.query['order'] as 'asc' | 'desc' | undefined;
  const search = req.query['search'] as string | undefined;

  let filter = '';
  if (search) {
    // Sanitize input to prevent PocketBase filter injection
    const sanitizedSearch = sanitizePocketBaseFilter(search);
    filter = `message ~ "${sanitizedSearch}" || resource ~ "${sanitizedSearch}" || action ~ "${sanitizedSearch}"`;
  }
  
  const result = await activityLogService.getAllFiltered({
    sort,
    order,
    filter: filter || undefined,
  });
  
  res.json({ success: true, data: result });
};
