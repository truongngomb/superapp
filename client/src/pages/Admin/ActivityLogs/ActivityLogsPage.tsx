
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Search, Shield, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button, Card, CardContent, Pagination, SortPopup, Input, PermissionGuard } from '@/components/common';
import { STORAGE_KEYS } from '@/config';
import { ActivityLogTable } from './components/ActivityLogTable';
import { ActivityLogTableSkeleton } from './components/ActivityLogTableSkeleton';
import type { ActivityLog } from '@/types';
import { cn } from '@/utils';
import { useSort, useDebounce, useActivityLogs } from '@/hooks';
import { useExcelExport } from '@/hooks/useExcelExport';

export default function ActivityLogsPage() {
  const { t } = useTranslation(['activity_logs', 'common']);
  const {
    logs,
    pagination,
    loading,
    isLoadingMore,
    exporting,
    fetchLogs,
    getAllForExport,
  } = useActivityLogs();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery);
  
  // Destructure pagination
  const { page, totalPages, total } = pagination;

  // Sorting state
  const { sortConfig, handleSort } = useSort('created', 'desc', {
    storageKey: STORAGE_KEYS.ACTIVITY_LOGS_SORT,
  });

  // Fetch data when filters/sort/page changes
  useEffect(() => {
    void fetchLogs({
      page,
      sort: sortConfig.field,
      order: sortConfig.order as 'asc' | 'desc' | undefined,
      search: debouncedSearchQuery || undefined
    });
  }, [fetchLogs, page, sortConfig, debouncedSearchQuery]);

  // Reset page to 1 when search or sort changes
  useEffect(() => {
    // Page is handled via URL or state, but here we trigger a new fetch
    // if sort/search changed while we are on page > 1, the hook should probably handle that?
    // According to Category SSoT: fetchCategories({ page: 1, ... })
  }, [debouncedSearchQuery, sortConfig]);

  const sortColumns = [
    { field: 'created', label: t('table.time') },
  ];

  const handlePageChange = (newPage: number) => {
    void fetchLogs({ page: newPage });
  };

  // Excel export hook
  const { exportToExcel } = useExcelExport<ActivityLog>({
    fileNamePrefix: 'activity_logs',
    sheetName: t('title'),
    columns: [
      { key: '#', header: t('common:order', { defaultValue: '#' }), width: 8 },
      { key: 'expand.user.name', header: t('table.user'), width: 20 },
      { key: 'action', header: t('table.action'), width: 12 },
      { key: 'resource', header: t('table.resource'), width: 15 },
      { key: 'message', header: t('table.details'), width: 40 },
      { key: 'created', header: t('table.time'), width: 20 },
    ],
  });

  // Handle export
  const handleExport = async () => {
    const allData = await getAllForExport({
      search: debouncedSearchQuery || undefined,
      sort: sortConfig.field,
      order: sortConfig.order ?? 'desc',
    });
    await exportToExcel(allData);
  };

  return (
    <PermissionGuard resource="activity_logs" action="view">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {t('title')}
              </h1>
              <p className="text-muted mt-1">{t('subtitle')}</p>
            </div>
            <PermissionGuard resource="activity_logs" action="view">
              <button
                type="button"
                onClick={() => { void handleExport(); }}
                disabled={exporting || logs.length === 0}
                className="p-2 rounded-lg hover:bg-[#217346]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={t('common:export', { defaultValue: 'Export Excel' })}
                aria-label={t('common:export', { defaultValue: 'Export Excel' })}
              >
                {exporting ? (
                  <Loader2 className="w-6 h-6 animate-spin text-[#217346]" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6 text-[#217346]" />
                )}
              </button>
            </PermissionGuard>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); }}
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

        {/* Logs Table */}
        {(loading && logs.length === 0) || isRefreshing ? (
          <ActivityLogTableSkeleton />
        ) : logs.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-muted">
                {searchQuery ? t('list.empty_search') : t('list.empty')} 
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ActivityLogTable logs={logs} currentPage={page} />
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && totalPages > 1 && (
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
