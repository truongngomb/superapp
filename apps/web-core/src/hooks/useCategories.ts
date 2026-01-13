import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryService } from '@/services';
import { useToast } from '@/context';
import type { Category, CreateCategoryInput, CategoryListParams } from '@/types';
import { logger } from '@/utils/logger';
import { ApiException } from '@/config';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const toast = useToast();
  const { t } = useTranslation(['categories', 'common']);
  
  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const lastParamsRef = useRef<CategoryListParams | undefined>(undefined);

  // Use ref to avoid infinite loop when reloading
  const isReloading = useRef(false);

  const fetchCategories = useCallback(async (params?: CategoryListParams) => {
    // Determine if this is a page change (loadingMore) or initial/filter change
    const isPageChange = params?.page !== undefined && 
      params.page !== 1 && 
      lastParamsRef.current?.page !== params.page;

    // Update last params
    if (params !== undefined) {
      lastParamsRef.current = { ...lastParamsRef.current, ...params };
    }

    // Skip if already reloading (prevent loop)
    if (isReloading.current) return;
    
    // Set appropriate loading state
    if (isPageChange) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await categoryService.getPage(lastParamsRef.current);
      setCategories(data.items);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (error) {
      logger.warn('useCategories', 'Failed to load categories:', error);
      toast.error(t('common:toast.load_error'));
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast, t]);

  // Silent reload without setting loading state
  const reloadCategories = async () => {
    try {
      isReloading.current = true;
      const data = await categoryService.getPage(lastParamsRef.current);
      setCategories(data.items);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (error) {
      logger.warn('useCategories', 'Failed to reload categories:', error);
    } finally {
      isReloading.current = false;
    }
  };

  const createCategory = async (data: CreateCategoryInput) => {
    setSubmitting(true);
    try {
      await categoryService.create(data);
      toast.success(t('common:toast.create_success'));
      // Reload list after create
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateCategory = async (id: string, data: CreateCategoryInput) => {
    setSubmitting(true);
    try {
      await categoryService.update(id, data);
      toast.success(t('common:toast.update_success'));
      // Reload list after update
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setDeleting(true);
    try {
      const category = categories.find(c => c.id === id);
      await categoryService.delete(id);
      
      const successMessage = category?.isDeleted 
        ? t('common:toast.hard_delete_success') 
        : t('common:toast.delete_success');
      
      toast.success(successMessage);
      // Reload list after delete
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const deleteCategories = async (ids: string[]) => {
    setBatchDeleting(true);
    try {
      const hasDeleted = ids.some(id => categories.find(c => c.id === id)?.isDeleted);
      await categoryService.deleteMany(ids);
      
      const successMessage = hasDeleted
        ? t('common:toast.batch_hard_delete_success', { count: ids.length })
        : t('common:toast.batch_delete_success', { count: ids.length });

      toast.success(successMessage);
      // Reload list after delete
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setBatchDeleting(false);
    }
  };

  const updateCategoriesStatus = async (ids: string[], isActive: boolean) => {
    setSubmitting(true);
    try {
      // Assuming categoryService has a batchUpdateStatus or we use a custom fetch
      // For now, let's use the explicit endpoint we added to Backend
      await categoryService.batchUpdateStatus(ids, isActive);
      toast.success(t('common:toast.batch_status_success', { count: ids.length }));
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };


  const restoreCategory = async (id: string) => {
    setSubmitting(true);
    try {
      await categoryService.restore(id);
      toast.success(t('common:toast.restore_success', { defaultValue: 'Category restored successfully' }));
      // Reload list after restore
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };



  const restoreCategories = async (ids: string[]) => {
    setSubmitting(true);
    try {
      await categoryService.restoreMany(ids);
      toast.success(t('common:toast.batch_restore_success', { count: ids.length, defaultValue: 'Successfully restored {{count}} categories' }));
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const getAllForExport = async (params?: CategoryListParams) => {
    setExporting(true);
    try {
      return await categoryService.getAllForExport(params);
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.load_error');
      toast.error(message);
      logger.warn('useCategories', 'Failed to get categories for export:', error);
      return [];
    } finally {
      setExporting(false);
    }
  };

  return {
    categories,
    pagination,
    loading,
    isLoadingMore,
    submitting,
    deleting,
    fetchCategories,
    createCategory,
    updateCategory,
    restoreCategory,
    restoreCategories,
    deleteCategory,
    deleteCategories,
    updateCategoriesStatus,
    batchDeleting,
    exporting,
    getAllForExport,
  };
}
