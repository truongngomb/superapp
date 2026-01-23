import { useQuery } from '@tanstack/react-query';
import { systemService } from '@/services/system.service';
import type { RequestMetrics } from '@superapp/shared-types';

export function useRequestMetrics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['system-request-metrics'],
    queryFn: systemService.getRequestMetrics,
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    retry: 3,
  });

  return {
    metrics: data,
    isLoading,
    error,
    refetch
  };
}
