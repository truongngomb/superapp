import type { BaseEntity, PaginatedResponse } from './common';

// ============================================================================
// Entity
// ============================================================================

export type ActivityAction = 'create' | 'update' | 'delete' | 'login' | 'logout';

/**
 * Activity log entity - read-only, extends BaseEntity
 */
export interface ActivityLog extends BaseEntity {
  user?: string;
  expand?: {
    user?: {
      name: string;
      avatar?: string;
    };
  };
  action: ActivityAction;
  resource: string;
  recordId?: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Paginated activity logs response
 */
export type PaginatedActivityLogs = PaginatedResponse<ActivityLog>;

export interface ActivityLogParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}
