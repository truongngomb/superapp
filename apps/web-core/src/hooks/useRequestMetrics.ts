import { systemService } from '@superapp/core-logic';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/config';

export function useRequestMetrics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.systemHealth.metrics('requests'),
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
