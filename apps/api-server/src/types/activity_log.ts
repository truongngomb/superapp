import type { ActivityLog } from '@superapp/shared-types';
export type { ActivityLog };

// Re-export specific action type (derived) to avoid import issues
export type ActivityLogAction = ActivityLog['action'];

// =============================================================================
// Activity Log Input Types
// =============================================================================

/**
 * Input for creating an activity log entry
 */
export interface ActivityLogInput {
  user?: string;
  action: ActivityLog['action'];
  resource: string;
  recordId?: string;
  message: string;
  details?: Record<string, unknown>;
}
