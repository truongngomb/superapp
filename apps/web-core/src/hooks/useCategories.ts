import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryService } from '@/services';
import { useToast } from '@/context';
import type { Category, CreateCategoryInput, CategoryListParams } from '@superapp/shared-types';
import { logger } from '@/utils';
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
  const { t } = useTranslation(['categories', 'uikit']);
  
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
      toast.error(t('uikit:toast.load_error'));
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
      const entity = t('categories:entity');
      toast.success(t('uikit:toast.create_success', { entity }));
      // Reload list after create
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('uikit:toast.error');
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
      const entity = t('categories:entity');
      toast.success(t('uikit:toast.update_success', { entity }));
      // Reload list after update
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('uikit:toast.error');
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
      
      const entity = t('categories:entity');
      const successMessage = category?.isDeleted 
        ? t('uikit:toast.hard_delete_success', { entity }) 
        : t('uikit:toast.delete_success', { entity });
      
      toast.success(successMessage);
      // Reload list after delete
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('uikit:toast.error');
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
      
      const entities = t('categories:entities');
      const successMessage = hasDeleted
        ? t('uikit:toast.batch_hard_delete_success', { count: ids.length, entities })
        : t('uikit:toast.batch_delete_success', { count: ids.length, entities });

      toast.success(successMessage);
      // Reload list after delete
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('uikit:toast.error');
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
      const entities = t('categories:entities');
      toast.success(t('uikit:toast.batch_status_success', { count: ids.length, entities }));
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('uikit:toast.error');
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
      const entity = t('categories:entity');
      toast.success(t('uikit:toast.restore_success', { entity }));
      // Reload list after restore
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('uikit:toast.error');
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
      const entities = t('categories:entities');
      toast.success(t('uikit:toast.batch_restore_success', { count: ids.length, entities }));
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('uikit:toast.error');
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
      const message = error instanceof ApiException ? error.message : t('uikit:toast.load_error');
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
