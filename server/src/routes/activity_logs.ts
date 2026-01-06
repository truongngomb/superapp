/**
 * Activity Logs Routes
 */
import { Router } from 'express';
import { activityLogService } from '../services/index.js';
import { asyncHandler, authenticate, requirePermission } from '../middleware/index.js';
import { Resources, Actions } from '../types/index.js';
import { sanitizePocketBaseFilter } from '../utils/index.js';

const router = Router();

/**
 * GET /api/activity-logs - Get paginated logs (Admin only)
 */
router.get('/', authenticate, requirePermission(Resources.ROLES, Actions.VIEW), asyncHandler(async (req, res) => {
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
}));

export const activityLogsRouter = router;
