import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';

import { Clock } from 'lucide-react';
import { ActivityLog } from '@/types';
import { cn, getDateLocale } from '@/utils';

interface ActivityLogTableProps {
  logs: ActivityLog[];
  currentPage?: number;
  perPage?: number;
}

export function ActivityLogTable({ logs, currentPage = 1, perPage = 10 }: ActivityLogTableProps) {
  const { t, i18n } = useTranslation('activity_logs');
  const { t: tCommon } = useTranslation('common');

  return (
    <div className="w-full overflow-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-background text-muted-foreground">
          <tr>
            <th className="w-12 h-12 px-4 text-center font-medium">{tCommon('order')}</th>
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
              <td colSpan={6} className="h-24 text-center text-muted">
                {tCommon('no_data')}
              </td>
            </tr>
          ) : (
            logs.map((log, index) => {
              const orderNumber = (currentPage - 1) * perPage + index + 1;
              return (
                <tr key={log.id} className="border-t border-border transition-colors hover:bg-muted/5">
                  <td className="p-4 align-middle text-center text-muted-foreground">
                    {orderNumber}
                  </td>
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
                          locale: getDateLocale(i18n.language)
                        })}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
