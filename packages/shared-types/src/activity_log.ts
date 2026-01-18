import type { PaginatedResponse, BaseListParams } from './common.js';

// ============================================================================
// Entity
// ============================================================================

export type ActivityLogAction = 'create' | 'update' | 'delete' | 'login' | 'logout';

/**
 * Activity log entity - read-only
 * Note: Activity logs in backend might not have all BaseEntity fields (like updated/isActive)
 */
export interface ActivityLog {
  id: string;
  created: string;
  user?: string;
  expand?: {
    user?: {
      name: string;
      avatar?: string;
    };
  };
  action: ActivityLogAction;
  resource: string;
  recordId?: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Input/DTO Types
// ============================================================================

/**
 * Input for creating an activity log entry
 */
export interface ActivityLogInput {
  user?: string;
  action: ActivityLogAction;
  resource: string;
  recordId?: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Paginated activity logs response
 */
export type PaginatedActivityLogs = PaginatedResponse<ActivityLog>;

export type ActivityLogParams = BaseListParams;
