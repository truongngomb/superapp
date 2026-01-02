import type { ActivityLog } from '@/types';

export interface ActivityLogContextType {
  logs: ActivityLog[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  resetUnreadCount: () => void;
  refetch: () => Promise<void>;
}
