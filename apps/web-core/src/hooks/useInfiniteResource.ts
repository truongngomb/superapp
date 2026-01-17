/**
 * useInfiniteResource Hook
 * 
 * Extends useResource with infinite scroll capabilities for mobile views.
 * Accumulates items across pages when in infinite scroll mode.
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { BaseListParams } from './useResource';

/**
 * Minimal props needed from useResource for infinite scroll
 */
interface ResourceHookProps<T, ListParams extends BaseListParams> {
  items: T[];
  total: number;
  queryParams: ListParams;
  fetchItems: (params?: ListParams) => Promise<void>;
  isLoadingMore: boolean;
}

interface UseInfiniteResourceOptions<T, ListParams extends BaseListParams> {
  /** The base resource hook return */
  resourceHook: ResourceHookProps<T, ListParams>;
  /** Whether infinite scroll mode is enabled */
  enabled?: boolean;
  /** Items per page for infinite loading */
  pageSize?: number;
}

interface UseInfiniteResourceReturn<T> {
  /** All accumulated items (for infinite scroll) */
  allItems: T[];
  /** Whether there are more pages to load */
  hasNextPage: boolean;
  /** Whether currently fetching next page */
  isFetchingNextPage: boolean;
  /** Fetch the next page of items */
  fetchNextPage: () => Promise<void>;
  /** Reset to first page (clears accumulated items) */
  resetInfiniteScroll: () => void;
  /** Current page number in infinite mode */
  currentInfinitePage: number;
}

export function useInfiniteResource<T extends { id: string }, ListParams extends BaseListParams>({
  resourceHook,
  enabled = true,
  pageSize = 10,
}: UseInfiniteResourceOptions<T, ListParams>): UseInfiniteResourceReturn<T> {
  const { items, total, queryParams, fetchItems, isLoadingMore } = resourceHook;
  
  // State for accumulated items
  const [accumulatedItems, setAccumulatedItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  
  // Track filter changes to reset accumulation
  const prevFiltersRef = useRef<string>('');
  
  // Create filter signature (excluding page and limit)
  const filterSignature = useMemo(() => {
    const params = queryParams as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, limit, ...filters } = params;
    return JSON.stringify(filters);
  }, [queryParams]);

  // Reset accumulation when filters change
  useEffect(() => {
    if (prevFiltersRef.current && prevFiltersRef.current !== filterSignature) {
      // Filters changed, reset accumulation
      setAccumulatedItems([]);
      setCurrentPage(1);
    }
    prevFiltersRef.current = filterSignature;
  }, [filterSignature]);

  // Update accumulated items when new items arrive
  useEffect(() => {
    if (!enabled || items.length === 0) return;
    
    const currentPageNum = queryParams.page || 1;
    
    if (currentPageNum === 1) {
      // First page - replace all
      setAccumulatedItems(items);
      setCurrentPage(1);
    } else {
      // Subsequent pages - append unique items
      setAccumulatedItems(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const newItems = items.filter(item => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    }
  }, [enabled, items, queryParams.page]);

  // Calculate if there are more pages
  const hasNextPage = useMemo(() => {
    if (!enabled) return false;
    const totalPages = Math.ceil(total / pageSize);
    return currentPage < totalPages;
  }, [enabled, total, pageSize, currentPage]);

  // Fetch next page
  const fetchNextPage = useCallback(async () => {
    if (!enabled || !hasNextPage || isFetchingNext) return;
    
    try {
      setIsFetchingNext(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      await fetchItems({ page: nextPage } as Partial<ListParams> as ListParams);
    } finally {
      setIsFetchingNext(false);
    }
  }, [enabled, hasNextPage, isFetchingNext, currentPage, fetchItems]);

  // Reset infinite scroll
  const resetInfiniteScroll = useCallback(() => {
    setAccumulatedItems([]);
    setCurrentPage(1);
  }, []);

  return {
    allItems: enabled ? accumulatedItems : items,
    hasNextPage,
    isFetchingNextPage: isFetchingNext || isLoadingMore,
    fetchNextPage,
    resetInfiniteScroll,
    currentInfinitePage: currentPage,
  };
}
