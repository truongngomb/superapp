
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Search, Shield } from 'lucide-react';
import { Button, Card, CardContent, Pagination, SortBar, Input, LoadingSpinner } from '@/components/common';
import { ActivityLogTable } from './components/ActivityLogTable';
import { activityLogService } from '@/services';
import type { ActivityLog } from '@/types';
import { cn, logger } from '@/utils';
import { useSort } from '@/hooks';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Translations
  const { t } = useTranslation('activity_logs');
  const { t: tCommon } = useTranslation('common');
  
  // Sorting state
  const { sortConfig, handleSort } = useSort('created', 'desc');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await activityLogService.getLogs({
        page,
        // limit: undefined, // Let backend decide default
        sort: sortConfig.field,
        order: sortConfig.order as 'asc' | 'desc' | undefined,
        search: searchQuery
      });
      setLogs(response.items);
      setTotalPages(response.totalPages);
    } catch (error) {
      logger.error('ActivityLogsPage', 'Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  }, [page, sortConfig, searchQuery]); // Re-add searchQuery dependency as it is now used

  useEffect(() => {
    setPage(1); 
  }, [searchQuery]); 

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const sortColumns = [
    { field: 'created', label: t('table.time') },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('title')}
          </h1>
          <p className="text-muted mt-1">{t('description')}</p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); }}
            placeholder={tCommon('search')}
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

      {/* Sort Bar */}
      <SortBar 
        columns={sortColumns}
        currentSort={sortConfig}
        onSort={handleSort}
      />

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner size="lg" text={tCommon('loading')} className="py-20" />
      ) : logs.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">
              {searchQuery ? tCommon('no_data') : tCommon('no_data')} 
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
      {!loading && logs.length > 0 && (
        <div className="flex justify-end my-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
