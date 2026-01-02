/**
 * Activity Log Types
 */


export type ActivityAction = 'create' | 'update' | 'delete' | 'login' | 'logout';

export interface ActivityLog {
  id: string;
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
  created: string;
  updated: string;
}

export interface PaginatedActivityLogs {
  items: ActivityLog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ActivityLogParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
