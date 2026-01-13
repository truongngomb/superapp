import type { BaseEntity } from './common';

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

export interface PaginatedActivityLogs {
  items: ActivityLog[];
  page: number;
  total: number;
  totalPages: number;
}

export interface ActivityLogParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}
