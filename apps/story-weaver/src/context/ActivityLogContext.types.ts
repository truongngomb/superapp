import type { ActivityLog } from '@superapp/shared-types';

export interface ActivityLogContextType {
  logs: ActivityLog[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  resetUnreadCount: () => void;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  isLoadingMore: boolean;
}
