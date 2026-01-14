import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import { DataTable, type Column } from '@/components/common';
import { ActivityLog } from '@superapp/shared-types';
import { cn, getDateLocale } from '@/utils';

interface ActivityLogTableProps {
  logs: ActivityLog[];
  currentPage?: number;
  perPage?: number;
  sortConfig?: {
    field: string;
    order: 'asc' | 'desc';
  };
  onSort?: (field: string) => void;
  isLoading?: boolean;
}

export function ActivityLogTable({ 
  logs, 
  currentPage = 1, 
  perPage = 10,
  sortConfig,
  onSort,
  isLoading
}: ActivityLogTableProps) {
  const { t, i18n } = useTranslation('activity_logs');
  const { t: tCommon } = useTranslation('common');

  const columns: Column<ActivityLog>[] = useMemo(() => [
    {
      key: 'user',
      header: t('table.user'),
      render: (log) => (
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 overflow-hidden rounded-full bg-secondary/10">
            {log.expand?.user?.avatar ? (
              <img 
                src={log.expand.user.avatar} 
                alt={log.expand.user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                <span className="text-xs font-bold">
                  {(log.expand?.user?.name || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium truncate">{log.expand?.user?.name || 'Unknown User'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'action',
      header: t('table.action'),
      render: (log) => (
        <span className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
          log.action === 'create' && "bg-green-500/10 text-green-500 border-green-500/20",
          log.action === 'update' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
          log.action === 'delete' && "bg-red-500/10 text-red-500 border-red-500/20",
          log.action === 'login' && "bg-purple-500/10 text-purple-500 border-purple-500/20",
          log.action === 'logout' && "bg-orange-500/10 text-orange-500 border-orange-500/20",
        )}>
          {t(`actions.${log.action}`, { defaultValue: log.action.toUpperCase() })}
        </span>
      )
    },
    {
      key: 'resource',
      header: t('table.resource'),
      render: (log) => (
        <span className="capitalize text-muted-foreground">
          {t(`resources.${log.resource}`, { defaultValue: log.resource })}
        </span>
      )
    },
    {
      key: 'message',
      header: t('table.details'),
      className: 'max-w-[300px]',
      render: (log) => (
        <span className="text-foreground/90 truncate block" title={JSON.stringify(log.details)}>
          {log.message || (log.details ? JSON.stringify(log.details) : '-')}
        </span>
      )
    },
    {
      key: 'created',
      header: t('table.time'),
      sortable: true,
      render: (log) => (
        <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap" title={new Date(log.created).toLocaleString()}>
          <Clock className="w-3.5 h-3.5" />
          <span>
            {formatDistanceToNow(new Date(log.created), { 
              addSuffix: true,
              locale: getDateLocale(i18n.language)
            })}
          </span>
        </div>
      )
    }
  ], [t, i18n.language]);

  return (
    <DataTable<ActivityLog>
      data={logs}
      columns={columns}
      keyExtractor={(log) => log.id}
      currentPage={currentPage}
      perPage={perPage}
      sortColumn={sortConfig?.field}
      sortDirection={sortConfig?.order}
      onSort={onSort}
      isLoading={isLoading}
      emptyMessage={tCommon('no_data')}
    />
  );
}
