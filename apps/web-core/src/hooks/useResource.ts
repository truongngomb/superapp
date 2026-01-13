import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks';
import { useTranslation } from 'react-i18next';
import type { ResourceService } from './useResourceService';

interface UseResourceOptions<T, CreateInput, UpdateInput, ListParams> {
  service: ResourceService<T, CreateInput, UpdateInput, ListParams>;
  initialParams?: ListParams;
  resourceName: string; // e.g., 'categories', 'users' for i18n
}

export interface BaseListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
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
}: UseResourceOptions<T, CreateInput, UpdateInput, ListParams>): UseResourceReturn<T, CreateInput, UpdateInput, ListParams> {
  const { t } = useTranslation('common');
  const { success, error: errorToast } = useToast();

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [queryParams, setQueryParams] = useState<ListParams>((initialParams || {}) as ListParams);

  const fetchItems = useCallback(async (params?: ListParams) => {
    const isPageChange = params?.page !== undefined && params.page !== queryParams.page;

    if (isPageChange) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const mergedParams = { ...queryParams, ...params };
      const response = await service.getPage(mergedParams) as unknown;
      
      // Handle different response structures if necessary
      if (response && typeof response === 'object' && 'items' in response && Array.isArray((response as { items: unknown[] }).items)) {
         setItems((response as { items: T[] }).items);
         setTotal((response as { total?: number }).total || 0);
      } else if (Array.isArray(response)) {
         setItems(response as T[]);
         setTotal(response.length);
      }
      
      setQueryParams(mergedParams);
    } catch (_error) {
      errorToast(t('toast.load_error', { entities: t(`resources.${resourceName}`) }));
      console.error(_error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [service, queryParams, resourceName, errorToast, t]);

  // Initial Load
  useEffect(() => {
     void fetchItems();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Selection Logic
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  }, [items]);

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    if (checked) {
       setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
       setSelectedIds(prev => prev.filter(i => i !== id));
    }
  }, []);

  // CRUD Actions
  const handleCreate = async (data: CreateInput) => {
    setLoading(true);
    try {
      await service.create(data);
      success(t('toast.create_success', { entity: t(`resources.${resourceName}`) }));
      await fetchItems(); // Refresh
      return true;
    } catch {
      errorToast(t('toast.error'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: UpdateInput) => {
    setLoading(true);
    try {
      await service.update(id, data);
      success(t('toast.update_success', { entity: t(`resources.${resourceName}`) }));
      await fetchItems();
      return true;
    } catch {
      errorToast(t('toast.error'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
       await service.delete(id);
       success(t('toast.delete_success'));
       await fetchItems();
    } catch {
       errorToast(t('toast.error'));
    }
  };

  const handleRestore = async (id: string) => {
    try {
       await service.restore(id);
       success(t('toast.restore_success', { entity: t(`resources.${resourceName}`) }));
       await fetchItems();
    } catch {
       errorToast(t('toast.error'));
    }
  };

  const handleBatchDelete = async () => {
     if (selectedIds.length === 0) return;
     try {
       await service.deleteMany(selectedIds);
       success(t('toast.batch_delete_success', { count: selectedIds.length, entities: t(`resources.${resourceName}`) }));
       setSelectedIds([]);
       await fetchItems();
     } catch {
       errorToast(t('toast.error'));
     }
  };

  const handleBatchRestore = async () => {
    if (selectedIds.length === 0) return;
     try {
       await service.restoreMany(selectedIds);
       success(t('toast.batch_restore_success', { count: selectedIds.length, entities: t(`resources.${resourceName}`) }));
       setSelectedIds([]);
       await fetchItems();
     } catch {
       errorToast(t('toast.error'));
     }
  };

  const handleBatchUpdateStatus = async (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await service.batchUpdateStatus(selectedIds, isActive);
      success(t('toast.batch_status_success', { count: selectedIds.length }));
      await fetchItems();
    } catch {
      errorToast(t('toast.error'));
    }
  };

  const getAllForExport = async (params?: ListParams) => {
    setExporting(true);
    try {
      return await service.getAllForExport(params);
    } catch {
      errorToast(t('toast.load_error', { entities: t(`resources.${resourceName}`) }));
      return [];
    } finally {
      setExporting(false);
    }
  };

  return {
    items,
    loading,
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
