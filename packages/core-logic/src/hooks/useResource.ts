/**
 * useResource Hook - TanStack Query Implementation
 * 
 * Generic hook for managing CRUD operations with caching, pagination,
 * and automatic background updates. Moved to core-logic for reuse.
 */
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BaseListParams } from '@superapp/shared-types';

export interface ResourceService<T, CreateInput, UpdateInput, ListParams> {
  create?: (data: CreateInput) => Promise<T>;
  update?: (id: string, data: UpdateInput) => Promise<T>;
  delete?: (id: string) => Promise<boolean>;
  restore?: (id: string) => Promise<boolean>;
  deleteMany?: (ids: string[]) => Promise<boolean>;
  restoreMany?: (ids: string[]) => Promise<boolean>;
  batchUpdateStatus?: (ids: string[], isActive: boolean) => Promise<boolean>;
  getPage: (params: ListParams) => Promise<{ items: T[]; total: number } | T[]>;
  getAllForExport?: (params?: ListParams) => Promise<T[]>;
}

export type ResourceAction = 'create' | 'update' | 'delete' | 'restore' | 'batch_delete' | 'batch_restore' | 'batch_status' | 'export';

export interface UseResourceOptions<T, CreateInput, UpdateInput, ListParams> {
  service: ResourceService<T, CreateInput, UpdateInput, ListParams>;
  initialParams?: ListParams;
  resourceName: string;
  /**
   * Callback on successful mutation
   */
  onSuccess?: (action: ResourceAction, count?: number) => void;
  /**
   * Callback on failed mutation
   */
  onError?: (action: ResourceAction, error: unknown) => void;
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

export function useResource<T extends { id: string }, CreateInput, UpdateInput, ListParams extends BaseListParams>({
  service,
  initialParams,
  resourceName,
  onSuccess,
  onError,
}: UseResourceOptions<T, CreateInput, UpdateInput, ListParams>): UseResourceReturn<T, CreateInput, UpdateInput, ListParams> {
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // URL Search Params sync
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse initial params from URL
  const getInitialParams = (): ListParams => {
    const urlParams: Partial<BaseListParams> & Record<string, unknown> = {};
    
    // Manual parsing to avoid dependency on strict shape
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

  useEffect(() => {
    paramsRef.current = queryParams;
  }, [queryParams]);

  const queryKey = useMemo(
    () => [resourceName, 'list', queryParams] as const,
    [resourceName, queryParams]
  );

  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery<({ items: T[]; total: number } | T[])>({
    queryKey,
    queryFn: async () => service.getPage(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const items = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    // Check if data is object with items array
    if (typeof data === 'object' && 'items' in data) {
      const dataObj = data as { items: T[] };
      if (Array.isArray(dataObj.items)) {
        return dataObj.items;
      }
    }
    return [];
  }, [data]);

  const total = useMemo(() => {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    if (typeof data === 'object' && 'total' in data) {
       return (data as { total?: number }).total || 0;
    }
    return 0;
  }, [data]);

  const loading = isLoading;
  const isLoadingMore = isFetching && !isLoading;

  const syncToUrl = useCallback((params: ListParams) => {
    setSearchParams((prevSearchParams: URLSearchParams) => {
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

  const setQueryParams = useCallback((params: ListParams) => {
    setQueryParamsState(params);
    syncToUrl(params);
  }, [syncToUrl]);

  const fetchItems = useCallback(async (params?: ListParams) => {
    const nextParams = { ...paramsRef.current, ...params };
    setQueryParams(nextParams);
    await refetch();
  }, [setQueryParams, refetch]);

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

  // Mutations
  const createMutation = useMutation<T, Error, CreateInput>({
    mutationFn: (data: CreateInput) => {
      if (!service.create) throw new Error('Create not supported');
      return service.create(data);
    },
    onSuccess: () => {
      if (onSuccess) onSuccess('create');
      void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: (error) => {
      if (onError) onError('create', error);
    },
  });

  const updateMutation = useMutation<T, Error, { id: string; data: UpdateInput }>({
    mutationFn: ({ id, data }: { id: string; data: UpdateInput }) => {
      if (!service.update) throw new Error('Update not supported');
      return service.update(id, data);
    },
    onSuccess: () => {
        if (onSuccess) onSuccess('update');
        void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: (error) => {
        if (onError) onError('update', error);
    },
  });

  const deleteMutation = useMutation<boolean, Error, string>({
    mutationFn: (id: string) => {
        if (!service.delete) throw new Error('Delete not supported');
        return service.delete(id);
    },
    onSuccess: () => {
        if (onSuccess) onSuccess('delete');
        void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: (error) => {
        if (onError) onError('delete', error);
    },
  });

  const restoreMutation = useMutation<boolean, Error, string>({
    mutationFn: (id: string) => {
        if (!service.restore) throw new Error('Restore not supported');
        return service.restore(id);
    },
    onSuccess: () => {
        if (onSuccess) onSuccess('restore');
        void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: (error) => {
        if (onError) onError('restore', error);
    },
  });

  const batchDeleteMutation = useMutation<boolean, Error, string[]>({
    mutationFn: (ids: string[]) => {
        if (!service.deleteMany) throw new Error('Batch delete not supported');
        return service.deleteMany(ids);
    },
    onSuccess: (_, ids) => {
        if (onSuccess) onSuccess('batch_delete', ids.length);
        setSelectedIds([]);
        void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: (error) => {
        if (onError) onError('batch_delete', error);
    },
  });

  const batchRestoreMutation = useMutation<boolean, Error, string[]>({
    mutationFn: (ids: string[]) => {
        if (!service.restoreMany) throw new Error('Batch restore not supported');
        return service.restoreMany(ids);
    },
    onSuccess: (_, ids) => {
        if (onSuccess) onSuccess('batch_restore', ids.length);
        setSelectedIds([]);
        void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: (error) => {
        if (onError) onError('batch_restore', error);
    },
  });

  const batchStatusMutation = useMutation<boolean, Error, { ids: string[]; isActive: boolean }>({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) => {
        if (!service.batchUpdateStatus) throw new Error('Batch status not supported');
        return service.batchUpdateStatus(ids, isActive);
    },
    onSuccess: (_, { ids }) => {
        if (onSuccess) onSuccess('batch_status', ids.length);
        void queryClient.invalidateQueries({ queryKey: [resourceName] });
    },
    onError: (error) => {
        if (onError) onError('batch_status', error);
    },
  });

  // Action wrappers
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

  const getAllForExport = useCallback(async (params?: ListParams) => {
    setExporting(true);
    try {
        if (!service.getAllForExport) throw new Error('Export not supported');
        return await service.getAllForExport(params);
    } catch (error) {
        if (onError) onError('export', error);
        return [];
    } finally {
      setExporting(false);
    }
  }, [service, onError]);

  return {
    items,
    loading: loading || createMutation.isPending || updateMutation.isPending,
    isLoadingMore,
    total,
    queryParams,
    setQueryParams,
    fetchItems,
    
    selectedIds,
    setSelectedIds,
    handleSelectAll,
    handleSelectOne,
    
    handleCreate,
    handleUpdate,
    handleDelete,
    handleRestore,
    handleBatchDelete,
    handleBatchRestore,
    handleBatchUpdateStatus,
    
    exporting,
    getAllForExport,
  };
}
