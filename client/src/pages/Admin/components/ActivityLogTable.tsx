import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { enUS, vi, ko } from 'date-fns/locale';

import { Clock } from 'lucide-react';
import { ActivityLog } from '@/types';
import { cn } from '@/utils';

interface ActivityLogTableProps {
  logs: ActivityLog[];
  loading: boolean;
}

export function ActivityLogTable({ logs, loading }: ActivityLogTableProps) {
  const { t, i18n } = useTranslation('activity_logs');
  const { t: tCommon } = useTranslation('common');

  const getDateLocale = () => {
    switch (i18n.language) {
      case 'vi': return vi;
      case 'ko': return ko;
      default: return enUS;
    }
  };

  if (loading) {
    return (
        <div className="w-full rounded-md border border-border">
          <div className="h-12 border-b border-border bg-muted/50" />
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 border-b border-border px-4 flex items-center gap-4 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/4 bg-muted rounded" />
                        <div className="h-3 w-1/2 bg-muted rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="w-full overflow-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-background text-muted-foreground">
          <tr>
            <th className="h-12 px-4 text-left font-medium">{t('table.user')}</th>
            <th className="h-12 px-4 text-left font-medium">{t('table.action')}</th>
            <th className="h-12 px-4 text-left font-medium">{t('table.resource')}</th>
            <th className="h-12 px-4 text-left font-medium">{t('table.details')}</th>
            <th className="h-12 px-4 text-left font-medium">{t('table.time')}</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={5} className="h-24 text-center text-muted">
                {tCommon('no_data')}
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="border-t border-border transition-colors hover:bg-muted/5">
                <td className="p-4 align-middle">
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
                        <div className="flex flex-col">
                            <span className="font-medium">{log.expand?.user?.name || 'Unknown User'}</span>
                        </div>
                    </div>
                </td>
                <td className="p-4 align-middle">
                    <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
                        log.action === 'create' && "bg-green-500/10 text-green-500 border-green-500/20",
                        log.action === 'update' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        log.action === 'delete' && "bg-red-500/10 text-red-500 border-red-500/20",
                        log.action === 'login' && "bg-purple-500/10 text-purple-500 border-purple-500/20",
                    )}>
                        {log.action.toUpperCase()}
                    </span>
                </td>
                <td className="p-4 align-middle">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="capitalize">{log.resource}</span>
                    </div>
                </td>
                <td className="p-4 align-middle">
                    <span className="text-foreground/90 max-w-[300px] truncate block" title={JSON.stringify(log.details)}>
                        {JSON.stringify(log.details)}
                    </span>
                </td>
                <td className="p-4 align-middle text-muted-foreground">
                    <div className="flex items-center gap-1.5" title={new Date(log.created).toLocaleString()}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                            {formatDistanceToNow(new Date(log.created), { 
                                addSuffix: true,
                                locale: getDateLocale()
                            })}
                        </span>
                    </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
