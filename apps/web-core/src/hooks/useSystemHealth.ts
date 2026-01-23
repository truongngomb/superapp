import { useQuery } from '@tanstack/react-query';
import { systemService } from '@/services';
import type { SystemStats } from '@superapp/shared-types';

export function useSystemHealth() {
  const { data, isLoading, error, refetch } = useQuery<SystemStats>({
    queryKey: ['system-health'],
    queryFn: systemService.getStats,
    refetchInterval: 2000, // Poll every 2 seconds
    refetchOnWindowFocus: true,
  });

  return {
    stats: data,
    loading: isLoading,
    error,
    refetch,
  };
}
