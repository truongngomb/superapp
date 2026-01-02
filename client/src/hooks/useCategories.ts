import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryService } from '@/services';
import { useToast } from '@/context';
import type { Category, CategoryInput } from '@/types';
import { logger } from '@/utils/logger';
import { ApiException } from '@/config';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const { t } = useTranslation('categories');
  
  // Use ref to avoid infinite loop when reloading
  const isReloading = useRef(false);

  const fetchCategories = useCallback(async () => {
    // Skip if already reloading (prevent loop)
    if (isReloading.current) return;
    
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      logger.warn('useCategories', 'Failed to load categories:', error);
      toast.error(t('toast.load_error'));
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  // Silent reload without setting loading state
  const reloadCategories = async () => {
    try {
      isReloading.current = true;
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      logger.warn('useCategories', 'Failed to reload categories:', error);
    } finally {
      isReloading.current = false;
    }
  };

  const createCategory = async (data: CategoryInput) => {
    setSubmitting(true);
    try {
      await categoryService.create(data);
      toast.success(t('toast.create_success'));
      // Reload list after create
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateCategory = async (id: string, data: CategoryInput) => {
    setSubmitting(true);
    try {
      await categoryService.update(id, data);
      toast.success(t('toast.update_success'));
      // Reload list after update
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setDeleting(true);
    try {
      await categoryService.delete(id);
      toast.success(t('toast.delete_success'));
      // Reload list after delete
      await reloadCategories();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('toast.error');
      toast.error(message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    categories,
    loading,
    submitting,
    deleting,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
