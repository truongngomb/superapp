
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Search, Shield, Loader2, FileSpreadsheet } from 'lucide-react';
import { Button, Card, CardContent, Pagination, SortPopup, Input, LoadingSpinner, PermissionGuard } from '@/components/common';
import { STORAGE_KEYS } from '@/config';
import { ActivityLogTable } from './components/ActivityLogTable';
import { activityLogService } from '@/services';
import type { ActivityLog } from '@/types';
import { cn, logger } from '@/utils';
import { useSort, useDebounce } from '@/hooks';
import { useExcelExport } from '@/hooks/useExcelExport';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [exporting, setExporting] = useState(false);

  // Translations
  const { t } = useTranslation(['activity_logs', 'common']);
  
  // Sorting state
  const { sortConfig, handleSort } = useSort('created', 'desc', {
    storageKey: STORAGE_KEYS.ACTIVITY_LOGS_SORT,
  });

  // Track last page to detect page changes
  const lastPageRef = useRef(1);

  const fetchLogs = useCallback(async (targetPage?: number) => {
    const currentPage = targetPage ?? page;
    const isPageChange = currentPage !== 1 && currentPage !== lastPageRef.current;

    // Set appropriate loading state
    if (isPageChange) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await activityLogService.getPage({
        page: currentPage,
        sort: sortConfig.field,
        order: sortConfig.order as 'asc' | 'desc' | undefined,
        search: debouncedSearchQuery
      });
      setLogs(response.items);
      setTotalPages(response.totalPages);
      setTotal(response.total);
      lastPageRef.current = currentPage;
    } catch (error) {
      logger.error('ActivityLogsPage', 'Failed to fetch logs', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [page, sortConfig, debouncedSearchQuery]);

  useEffect(() => {
    setPage(1); 
  }, [debouncedSearchQuery, sortConfig]); 

  useEffect(() => {
    void fetchLogs(page);
  }, [fetchLogs, page]);

  const sortColumns = [
    { field: 'created', label: t('table.time') },
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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
    setExporting(true);
    try {
      const allData = await activityLogService.getAllForExport({
        search: debouncedSearchQuery || undefined,
        sort: sortConfig.field,
        order: sortConfig.order ?? 'desc',
      });
      await exportToExcel(allData);
    } finally {
      setExporting(false);
    }
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
            onClick={() => { void fetchLogs(); }}
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </Button>
        </div>

        {/* Total items */}
        <div className="flex items-center justify-end mb-4">
          <p className="text-sm text-muted">
            {t('common:total_items', { count: total })}
          </p>
        </div>

        {/* Logs Table */}
        {loading ? (
          <LoadingSpinner size="lg" text={t('common:loading')} className="py-20" />
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
              <ActivityLogTable logs={logs} />
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && logs.length > 0 && totalPages > 1 && (
          <div className="my-4 relative">
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
