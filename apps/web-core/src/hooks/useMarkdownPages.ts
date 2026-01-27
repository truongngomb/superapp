import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useResource, type ResourceService, logger, markdownService } from '@superapp/core-logic';
import { useToast } from '@superapp/ui-kit';
import type { 
  MarkdownPage, 
  MarkdownPageCreateInput, 
  MarkdownPageUpdateInput,
  MarkdownPageListParams,
} from '@superapp/shared-types';

export function useMarkdownPages() {
  const toast = useToast();
  const { t } = useTranslation(['markdown', 'uikit']);

  const {
    items: pages,
    loading,
    isLoadingMore,
    total,
    queryParams,
    fetchItems,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleRestore,
    handleBatchDelete,
    handleBatchRestore,
    handleBatchUpdateStatus
  } = useResource<MarkdownPage, MarkdownPageCreateInput | FormData, MarkdownPageUpdateInput | FormData, MarkdownPageListParams>({
    service: markdownService as unknown as ResourceService<MarkdownPage, MarkdownPageCreateInput | FormData, MarkdownPageUpdateInput | FormData, MarkdownPageListParams>,
    resourceName: 'markdown_pages',
    initialParams: {
      page: 1,
      limit: 10,
      sort: 'updated',
      order: 'desc'
    },
    onSuccess: (action, count) => {
      const entity = t('markdown:name');
      const entities = t('markdown:entities');

      switch (action) {
        case 'create':
          toast.success(t('uikit:toast.create_success', { entity }));
          break;
        case 'update':
          toast.success(t('uikit:toast.update_success', { entity }));
          break;
        case 'delete':
          toast.success(t('uikit:toast.delete_success', { entity }));
          break;
        case 'restore':
          toast.success(t('uikit:toast.restore_success', { entity }));
          break;
        case 'batch_delete':
          toast.success(t('uikit:toast.batch_delete_success', { count, entities }));
          break;
        case 'batch_restore':
          toast.success(t('uikit:toast.batch_restore_success', { count, entities }));
          break;
        case 'batch_status':
          toast.success(t('uikit:toast.batch_status_success', { count, entities }));
          break;
      }
    },
    onError: (_action, error) => {
      const message = error instanceof Error ? error.message : t('uikit:toast.error');
      toast.error(message);
    }
  });

  // Additional helper to get all pages without pagination (for dropdowns)
  const getAllPages = useCallback(async () => {
    try {
      // Use getPage with high limit to get all pages sorted by title
      const data = await markdownService.getPage({ 
        page: 1, 
        limit: 1000, 
        sort: 'translations.en.title', // Default sort
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
    pagination: {
      page: queryParams.page || 1,
      totalPages: Math.ceil(total / (queryParams.limit || 10)),
      total
    },
    loading,
    isLoadingMore,
    submitting: loading, // Map generic loading to submitting
    deleting: loading,   // Map generic loading to deleting
    batchDeleting: loading,
    
    fetchPages: fetchItems,
    reloadPages: fetchItems,
    createPage: handleCreate,
    updatePage: handleUpdate,
    deletePage: handleDelete,
    deletePages: handleBatchDelete,
    restorePage: handleRestore,
    restorePages: handleBatchRestore,
    updatePagesStatus: handleBatchUpdateStatus,
    getAllPages,
    getMenuTree
  };
}

