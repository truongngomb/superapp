import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { markdownService } from '@/services';
import { useToast } from '@/context';
import type { 
  MarkdownPage, 
  MarkdownPageCreateInput, 
  MarkdownPageUpdateInput,
  MarkdownPageListParams
} from '@superapp/shared-types';
import { logger } from '@superapp/core-logic';
import { ApiException } from '@/config';

export function useMarkdownPages() {
  const [pages, setPages] = useState<MarkdownPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  
  const toast = useToast();
  const { t } = useTranslation(['markdown', 'common']);
  
  // Pagination state
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const lastParamsRef = useRef<MarkdownPageListParams | undefined>(undefined);
  const isReloading = useRef(false);

  const fetchPages = useCallback(async (params?: MarkdownPageListParams) => {
    // Determine if this is a page change
    const isPageChange = params?.page !== undefined && 
      params.page !== 1 && 
      lastParamsRef.current?.page !== params.page;

    // Update last params
    if (params !== undefined) {
      lastParamsRef.current = { ...lastParamsRef.current, ...params };
    }

    if (isReloading.current) return;
    
    if (isPageChange) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await markdownService.getPage(lastParamsRef.current);
      setPages(data.items);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (error) {
      logger.warn('useMarkdownPages', 'Failed to load pages:', error);
      toast.error(t('common:toast.load_error'));
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast, t]);

  const reloadPages = async () => {
    try {
      isReloading.current = true;
      const data = await markdownService.getPage(lastParamsRef.current);
      setPages(data.items);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (error) {
      logger.warn('useMarkdownPages', 'Failed to reload pages:', error);
    } finally {
      isReloading.current = false;
    }
  };

  const createPage = async (data: MarkdownPageCreateInput | FormData) => {
    setSubmitting(true);
    try {
      await markdownService.create(data);
      toast.success(t('common:toast.create_success'));
      await reloadPages();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updatePage = async (id: string, data: MarkdownPageUpdateInput | FormData) => {
    setSubmitting(true);
    try {
      await markdownService.update(id, data);
      toast.success(t('common:toast.update_success'));
      await reloadPages();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deletePage = async (id: string) => {
    setDeleting(true);
    try {
      const page = pages.find(p => p.id === id);
      await markdownService.delete(id);
      
      const successMessage = page?.isDeleted 
        ? t('common:toast.hard_delete_success') 
        : t('common:toast.delete_success');
      
      toast.success(successMessage);
      await reloadPages();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  const deletePages = async (ids: string[]) => {
    setBatchDeleting(true);
    try {
      const hasDeleted = ids.some(id => pages.find(p => p.id === id)?.isDeleted);
      await markdownService.deleteMany(ids);
      
      const successMessage = hasDeleted
        ? t('common:toast.batch_hard_delete_success', { count: ids.length })
        : t('common:toast.batch_delete_success', { count: ids.length });

      toast.success(successMessage);
      await reloadPages();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setBatchDeleting(false);
    }
  };

  const restorePage = async (id: string) => {
    setSubmitting(true);
    try {
      await markdownService.restore(id);
      toast.success(t('common:toast.restore_success'));
      await reloadPages();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const restorePages = async (ids: string[]) => {
    setSubmitting(true);
    try {
      await markdownService.restoreMany(ids);
      toast.success(t('common:toast.batch_restore_success', { count: ids.length }));
      await reloadPages();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updatePagesStatus = async (ids: string[], isActive: boolean) => {
    setSubmitting(true);
    try {
      await markdownService.batchUpdateStatus(ids, isActive);
      toast.success(t('common:toast.batch_status_success', { count: ids.length }));
      await reloadPages();
      return true;
    } catch (error) {
      const message = error instanceof ApiException ? error.message : t('common:toast.error');
      toast.error(message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Additional helper to get all pages without pagination (for dropdowns)
  const getAllPages = useCallback(async () => {
    try {
      // Use getPage with high limit to get all pages sorted by title
      const data = await markdownService.getPage({ 
        page: 1, 
        limit: 1000, 
        sort: 'title',
        order: 'asc'
      });
      return data.items;
    } catch (error) {
      logger.warn('useMarkdownPages', 'Failed to load all pages:', error);
      return [];
    }
  }, []);

  // Helper for public menu
  const getMenuTree = useCallback(async () => {
    try {
      return await markdownService.getMenuTree();
    } catch (error) {
      logger.warn('useMarkdownPages', 'Failed to load menu tree:', error);
      return [];
    }
  }, []);

  return {
    pages,
    pagination,
    loading,
    isLoadingMore,
    submitting,
    deleting,
    batchDeleting,
    fetchPages,
    reloadPages,
    createPage,
    updatePage,
    deletePage,
    deletePages,
    restorePage,
    restorePages,
    updatePagesStatus,
    getAllPages,
    getMenuTree
  };
}
