
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw, Search, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button, Pagination, SortPopup, Input, PermissionGuard } from '@/components/common';
import { STORAGE_KEYS } from '@/config';
import { ActivityLogTable } from './components/ActivityLogTable';
import { ActivityLogTableSkeleton } from './components/ActivityLogTableSkeleton';
import type { ActivityLog } from '@superapp/shared-types';
import { cn } from '@/utils';
import { useSort, useDebounce, useActivityLogs, useExcelExport, useResponsiveView, useInfiniteResource } from '@/hooks';
import { ActivityLogMobileList } from './components/ActivityLogMobileList';
import { ActivityLogMobileCardSkeletonList } from './components/ActivityLogMobileCardSkeleton';

export default function ActivityLogsPage() {
  const { t } = useTranslation(['activity_logs', 'common']);
  const [searchParams] = useSearchParams();
  const {
    logs,
    pagination,
    loading,
    isLoadingMore,
    exporting,
    fetchLogs,
    getAllForExport,
    queryParams,
  } = useActivityLogs();

  // Responsive View
  const { effectiveView, isMobile } = useResponsiveView('list'); // Default to list view since we don't have view switcher here

  // Infinite scroll for mobile
  const infiniteProps = {
    items: logs,
    total: pagination.total,
    queryParams: {
        ...queryParams,
        page: pagination.page,
    },
    fetchItems: fetchLogs,
    isLoadingMore,
  };
  
  const {
    allItems: mobileLogs,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteResource({
    resourceHook: infiniteProps,
    enabled: isMobile,
    pageSize: 10,
  });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery);
  
  // Destructure pagination
  const { page, totalPages, total } = pagination;

  // Sorting state
  const urlSort = searchParams.get('sort');
  const urlOrder = searchParams.get('order');

  const { sortConfig, handleSort } = useSort('created', 'desc', {
    storageKey: STORAGE_KEYS.ACTIVITY_LOGS_SORT,
    initialOverride: (urlSort && (urlOrder === 'asc' || urlOrder === 'desc')) ? { field: urlSort, order: urlOrder } : undefined
  });



  // Ref to track filter changes
  const prevFiltersRef = useRef({
    search: debouncedSearchQuery,
    sort: sortConfig.field,
    order: sortConfig.order,
  });

  // 1. Initial Load
  useEffect(() => {
    void fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Handle Filter Changes
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const hasFilterChanged = 
      prev.search !== debouncedSearchQuery ||
      prev.sort !== sortConfig.field ||
      prev.order !== sortConfig.order;

    if (hasFilterChanged) {
      // Update ref
      prevFiltersRef.current = {
        search: debouncedSearchQuery,
        sort: sortConfig.field,
        order: sortConfig.order,
      };

      // Reset to page 1 on filter change
      void fetchLogs({
        page: 1,
        sort: sortConfig.field,
        order: sortConfig.order as 'asc' | 'desc' | undefined,
        search: debouncedSearchQuery ? debouncedSearchQuery : undefined
      });
    }
  }, [fetchLogs, sortConfig, debouncedSearchQuery]);

  const sortColumns = [
    { field: 'created', label: t('activity_logs:table.time') },
  ];


  const handlePageChange = (newPage: number) => {
    void fetchLogs({ page: newPage });
  };

  // Excel export hook
  const { exportToExcel } = useExcelExport<ActivityLog>({
    fileNamePrefix: 'activity_logs',
    sheetName: t('activity_logs:title'),
    columns: [
      { key: '#', header: t('common:order'), width: 8 },
      { key: 'expand.user.name', header: t('activity_logs:table.user'), width: 20 },
      { key: 'action', header: t('activity_logs:table.action'), width: 12 },
      { key: 'resource', header: t('activity_logs:table.resource'), width: 15 },
      { key: 'message', header: t('activity_logs:table.details'), width: 40 },
      { key: 'created', header: t('activity_logs:table.time'), width: 20 },
    ],
  });

  // Handle export
  const handleExport = async () => {
    const allData = await getAllForExport({
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: sortConfig.order ?? 'desc',
    });
    
    // Translate action and resource for export
    const translatedData = allData.map(log => ({
      ...log,
      action: t(`activity_logs:actions.${log.action}`),
      resource: t(`activity_logs:resources.${log.resource}`)
    }));

    await exportToExcel(translatedData as unknown as ActivityLog[]);
  };

  return (
    <PermissionGuard resource="activity_logs" action="view">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {t('activity_logs:title')}
              </h1>
              <p className="text-muted mt-1">{t('activity_logs:subtitle')}</p>
            </div>
            <PermissionGuard resource="activity_logs" action="view">
              <Button
                variant="ghost"
                onClick={() => { void handleExport(); }}
                disabled={exporting || logs.length === 0}
                className="h-10 w-10 p-0 text-[#217346] hover:bg-[#217346]/10"
                title={t('common:export_excel')}
                aria-label={t('common:export_excel')}
              >
                {exporting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6" />
                )}
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <Input
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); }}
              placeholder={t('common:search')}
              className="pl-10"
            />
          </div>
          <SortPopup
            columns={sortColumns}
            currentSort={sortConfig}
            onSort={handleSort}
          />
          <Button 
            variant="outline" 
            onClick={() => {
              setIsRefreshing(true);
              void fetchLogs().finally(() => { setIsRefreshing(false); });
            }}
          >
            <RefreshCw className={cn("w-5 h-5", (loading || isRefreshing) && "animate-spin")} />
          </Button>
        </div>

        {/* Total items */}
        <div className="flex items-center justify-end mb-4">
          <p className="text-sm text-muted">
            {t('common:total_items', { count: total })}
          </p>
        </div>

        {/* Logs Table / List */}
        <AnimatePresence mode="wait">
          <framerMotion.div
            key={loading && logs.length === 0 ? "loading" : logs.length === 0 ? "empty" : "content"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="min-h-[400px]"
          >
            {(loading && logs.length === 0) || isRefreshing ? (
               effectiveView === 'mobile' ? (
                 <ActivityLogMobileCardSkeletonList count={5} />
               ) : (
                 <ActivityLogTableSkeleton />
               )
            ) : (
               effectiveView === 'mobile' ? (
                 <ActivityLogMobileList
                   logs={mobileLogs}
                   hasNextPage={hasNextPage}
                   isFetchingNextPage={isFetchingNextPage}
                   fetchNextPage={fetchNextPage}
                   isLoading={loading}
                 />
               ) : (
                 <ActivityLogTable 
                   logs={logs} 
                   currentPage={page} 
                   sortConfig={{
                     field: sortConfig.field,
                     order: sortConfig.order === 'asc' ? 'asc' : 'desc'
                   }}
                   onSort={handleSort}
                   isLoading={loading}
                 />
               )
            )}
          </framerMotion.div>
        </AnimatePresence>


        {/* Pagination - Hide on mobile */}
        {!isMobile && !loading && logs.length > 0 && totalPages > 1 && (
          <div className="mt-4 relative">
            {isLoadingMore && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg z-10">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
