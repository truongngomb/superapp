/**
 * useResource Hook - TanStack Query Implementation
 * 
 * Generic hook for managing CRUD operations with caching, pagination,
 * and automatic background updates.
 * 
 * This is a drop-in replacement for the original useResource hook,
 * powered by TanStack Query for better caching and request deduplication.
 */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/context/useToast';
import { useTranslation } from 'react-i18next';
import type { ResourceService } from './useResourceService';
import type { BaseListParams } from '@superapp/shared-types';

// ============================================================================
// Types
// ============================================================================

interface UseResourceOptions<T, CreateInput, UpdateInput, ListParams> {
  service: ResourceService<T, CreateInput, UpdateInput, ListParams>;
  initialParams?: ListParams;
  resourceName: string; // e.g., 'categories', 'users' for i18n and query keys
}


export interface UseResourceReturn<T, CreateInput, UpdateInput, ListParams> {
  items: T[];
  loading: boolean;
  isLoadingMore: boolean;
  total: number;
  queryParams: ListParams;
  setQueryParams: (params: ListParams) => void;
  fetchItems: (params?: ListParams) => Promise<void>;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleSelectAll: (checked: boolean) => void;
  handleSelectOne: (id: string, checked: boolean) => void;
  handleCreate: (data: CreateInput) => Promise<boolean>;
  handleUpdate: (id: string, data: UpdateInput) => Promise<boolean>;
  handleDelete: (id: string) => Promise<void>;
  handleRestore: (id: string) => Promise<void>;
  handleBatchDelete: () => Promise<void>;
  handleBatchRestore: () => Promise<void>;
  handleBatchUpdateStatus: (isActive: boolean) => Promise<void>;
  exporting: boolean;
  getAllForExport: (params?: ListParams) => Promise<T[]>;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useResource<T extends { id: string }, CreateInput, UpdateInput, ListParams extends BaseListParams>({
  service,
  initialParams,
  resourceName,
}: UseResourceOptions<T, CreateInput, UpdateInput, ListParams>): UseResourceReturn<T, CreateInput, UpdateInput, ListParams> {
  const { t } = useTranslation('common');
  const { success, error: errorToast } = useToast();
  const queryClient = useQueryClient();

  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // URL Search Params sync
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse initial params from URL
  const getInitialParams = (): ListParams => {
    const urlParams: Partial<BaseListParams> & Record<string, unknown> = {};
    
    const page = searchParams.get('page');
    if (page) urlParams.page = parseInt(page, 10);
    
    const limit = searchParams.get('limit');
    if (limit) urlParams.limit = parseInt(limit, 10);
    
    const sort = searchParams.get('sort');
    if (sort) urlParams.sort = sort;
    
    const order = searchParams.get('order');
    if (order === 'asc' || order === 'desc') urlParams.order = order;
    
    const search = searchParams.get('search');
    if (search) urlParams.search = search;
    
    const isActive = searchParams.get('isActive');
    if (isActive !== null) urlParams.isActive = isActive === 'true';
    
    const isDeleted = searchParams.get('isDeleted');
    if (isDeleted !== null) urlParams.isDeleted = isDeleted === 'true';

    return { ...initialParams, ...urlParams } as ListParams;
  };

  const [queryParams, setQueryParamsState] = useState<ListParams>(getInitialParams);
  const paramsRef = useRef<ListParams>(queryParams);

  // Keep ref in sync
  useEffect(() => {
    paramsRef.current = queryParams;
  }, [queryParams]);

  // Query key for this resource
  const queryKey = useMemo(
    () => [resourceName, 'list', queryParams] as const,
    [resourceName, queryParams]
  );

  // ============================================================================
  // Main Query - List data with caching
  // ============================================================================
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await service.getPage(queryParams);
      return response;
    },
    // Keep previous data while fetching new page
    placeholderData: (previousData) => previousData,
  });

  // Extract items and total from response
  const items = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as T[];
    if ('items' in data && Array.isArray((data as { items: unknown[] }).items)) {
      return (data as { items: T[] }).items;
    }
    return [];
  }, [data]);

  const total = useMemo(() => {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    if ('total' in data) return (data as { total?: number }).total || 0;
    return 0;
  }, [data]);

  // Loading states
  const loading = isLoading;
  const isLoadingMore = isFetching && !isLoading;

  // ============================================================================
  // URL Sync
  // ============================================================================
  const syncToUrl = useCallback((params: ListParams) => {
    setSearchParams((prevSearchParams) => {
      const newSearchParams = new URLSearchParams(prevSearchParams);
      
      if (params.page && params.page > 1) newSearchParams.set('page', params.page.toString());
      else newSearchParams.delete('page');

      if (params.limit && params.limit !== 10) newSearchParams.set('limit', params.limit.toString());
      else newSearchParams.delete('limit');

      if (params.sort) newSearchParams.set('sort', params.sort);
      else newSearchParams.delete('sort');

      if (params.order) newSearchParams.set('order', params.order);
      else newSearchParams.delete('order');

      if (params.search) newSearchParams.set('search', params.search);
      else newSearchParams.delete('search');

      const paramsRecord = params as Record<string, unknown>;
      
      if (typeof paramsRecord.isActive === 'boolean') newSearchParams.set('isActive', String(paramsRecord.isActive));
      else newSearchParams.delete('isActive');

      if (typeof paramsRecord.isDeleted === 'boolean') newSearchParams.set('isDeleted', String(paramsRecord.isDeleted));
      else newSearchParams.delete('isDeleted');

      return newSearchParams;
    }, { replace: true });
  }, [setSearchParams]);

  // ============================================================================
  // Param Setters
  // ============================================================================
  const setQueryParams = useCallback((params: ListParams) => {
    setQueryParamsState(params);
    syncToUrl(params);
  }, [syncToUrl]);

  const fetchItems = useCallback(async (params?: ListParams) => {
    const nextParams = { ...paramsRef.current, ...params };
    setQueryParams(nextParams);
    // Query will automatically refetch due to queryKey change
    await refetch();
  }, [setQueryParams, refetch]);

  // ============================================================================
  // Selection Logic
  // ============================================================================
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  }, [items]);

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => checked 
      ? (prev.includes(id) ? prev : [...prev, id])
      : prev.filter(i => i !== id)
    );
  }, []);

  // ============================================================================
  // Mutations
  // ============================================================================
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateInput) => {
      if (!service.create) throw new Error('Create not supported');
      return service.create(data);
    },
    onSuccess: () => {
      success(t('toast.create_success', { entity: t(`resources.${resourceName}`) }));
      // Invalidate list queries to refetch fresh data
      void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: () => {
      errorToast(t('toast.error'));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInput }) => {
      if (!service.update) throw new Error('Update not supported');
      return service.update(id, data);
    },
    onSuccess: () => {
      success(t('toast.update_success', { entity: t(`resources.${resourceName}`) }));
      void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: () => {
      errorToast(t('toast.error'));
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!service.delete) throw new Error('Delete not supported');
      return service.delete(id);
    },
    onSuccess: () => {
      success(t('toast.delete_success'));
      void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: () => {
      errorToast(t('toast.error'));
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: string) => {
      if (!service.restore) throw new Error('Restore not supported');
      return service.restore(id);
    },
    onSuccess: () => {
      success(t('toast.restore_success', { entity: t(`resources.${resourceName}`) }));
      void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: () => {
      errorToast(t('toast.error'));
    },
  });

  // Batch delete mutation
  const batchDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => {
      if (!service.deleteMany) throw new Error('Batch delete not supported');
      return service.deleteMany(ids);
    },
    onSuccess: (_, ids) => {
      success(t('toast.batch_delete_success', { count: ids.length, entities: t(`resources.${resourceName}`) }));
      setSelectedIds([]);
      void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: () => {
      errorToast(t('toast.error'));
    },
  });

  // Batch restore mutation
  const batchRestoreMutation = useMutation({
    mutationFn: (ids: string[]) => {
      if (!service.restoreMany) throw new Error('Batch restore not supported');
      return service.restoreMany(ids);
    },
    onSuccess: (_, ids) => {
      success(t('toast.batch_restore_success', { count: ids.length, entities: t(`resources.${resourceName}`) }));
      setSelectedIds([]);
      void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: () => {
      errorToast(t('toast.error'));
    },
  });

  // Batch status mutation
  const batchStatusMutation = useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) => {
      if (!service.batchUpdateStatus) throw new Error('Batch status not supported');
      return service.batchUpdateStatus(ids, isActive);
    },
    onSuccess: (_, { ids }) => {
      success(t('toast.batch_status_success', { count: ids.length }));
      void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: () => {
      errorToast(t('toast.error'));
    },
  });

  // ============================================================================
  // Action Handlers (backward compatible API)
  // ============================================================================
  const handleCreate = useCallback(async (data: CreateInput) => {
    try {
      await createMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  }, [createMutation]);

  const handleUpdate = useCallback(async (id: string, data: UpdateInput) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return true;
    } catch {
      return false;
    }
  }, [updateMutation]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const handleRestore = useCallback(async (id: string) => {
    await restoreMutation.mutateAsync(id);
  }, [restoreMutation]);

  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    await batchDeleteMutation.mutateAsync(selectedIds);
  }, [selectedIds, batchDeleteMutation]);

  const handleBatchRestore = useCallback(async () => {
    if (selectedIds.length === 0) return;
    await batchRestoreMutation.mutateAsync(selectedIds);
  }, [selectedIds, batchRestoreMutation]);

  const handleBatchUpdateStatus = useCallback(async (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    await batchStatusMutation.mutateAsync({ ids: selectedIds, isActive });
  }, [selectedIds, batchStatusMutation]);

  // ============================================================================
  // Export
  // ============================================================================
  const getAllForExport = useCallback(async (params?: ListParams) => {
    setExporting(true);
    try {
      return await service.getAllForExport(params);
    } catch {
      errorToast(t('toast.load_error', { entities: t(`resources.${resourceName}`) }));
      return [];
    } finally {
      setExporting(false);
    }
  }, [service, resourceName, errorToast, t]);

  // ============================================================================
  // Return
  // ============================================================================
  return {
    items,
    loading: loading || createMutation.isPending || updateMutation.isPending,
    isLoadingMore,
    total,
    queryParams,
    setQueryParams,
    fetchItems,
    
    // Selection
    selectedIds,
    setSelectedIds,
    handleSelectAll,
    handleSelectOne,
    
    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    handleRestore,
    handleBatchDelete,
    handleBatchRestore,
    handleBatchUpdateStatus,
    
    // Export
    exporting,
    getAllForExport,
  };
}
