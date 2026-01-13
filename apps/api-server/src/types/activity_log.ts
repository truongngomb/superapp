/**
 * Activity Log Types
 */
import type { MinimalEntity } from './common.js';

// =============================================================================
// Activity Log Entity
// =============================================================================

/**
 * Activity log action types
 */
export type ActivityLogAction = 'create' | 'update' | 'delete' | 'login' | 'logout';

/**
 * Full activity log entity from database
 * Extends MinimalEntity as logs are read-only (no update, no soft delete)
 */
export interface ActivityLog extends MinimalEntity {
  user?: string;
  action: ActivityLogAction;
  resource: string;
  recordId?: string;
  message: string;
  details?: Record<string, unknown>;
  expand?: {
    user?: {
      name: string;
      avatar: string;
    };
  };
}

// =============================================================================
// Activity Log Input Types
// =============================================================================

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
