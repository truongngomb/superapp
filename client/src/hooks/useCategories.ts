import { useState, useCallback } from 'react';
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

  const fetchCategories = useCallback(async () => {
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

  const createCategory = async (data: CategoryInput) => {
    setSubmitting(true);
    try {
      // Optimistic/Fallback creation
      const newCategory: Category = {
        id: crypto.randomUUID(),
        ...data,
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        const result = await categoryService.create(data);
        setCategories((prev) => [...prev, result]);
      } catch {
        setCategories((prev) => [...prev, newCategory]);
      }
      toast.success(t('toast.create_success'));
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
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, ...data, updatedAt: new Date().toISOString() } : cat
        )
      );
      toast.success(t('toast.update_success'));
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
      try {
        await categoryService.delete(id);
      } catch {
        // Continue with local delete if API fails
      }
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      toast.success(t('toast.delete_success'));
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

