
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Search, Shield, Loader2 } from 'lucide-react';
import { Button, Card, CardContent, Pagination, SortBar, Input, LoadingSpinner, PermissionGuard } from '@/components/common';
import { ActivityLogTable } from './components/ActivityLogTable';
import { activityLogService } from '@/services';
import type { ActivityLog } from '@/types';
import { cn, logger } from '@/utils';
import { useSort, useDebounce } from '@/hooks';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Translations
  const { t } = useTranslation(['activity_logs', 'common']);
  
  // Sorting state
  const { sortConfig, handleSort } = useSort('created', 'desc');

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

  return (
    <PermissionGuard resource="activity_logs" action="view">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {t('title')}
            </h1>
            <p className="text-muted mt-1">{t('subtitle')}</p>
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
          <Button 
            variant="outline" 
            onClick={() => { void fetchLogs(); }}
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </Button>
        </div>

        {/* Sort Bar + Total */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <SortBar 
            columns={sortColumns}
            currentSort={sortConfig}
            onSort={handleSort}
          />
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
              <ActivityLogTable logs={logs} loading={loading} />
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
