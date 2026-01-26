/**
 * ActivityLogMobileList Component
 * 
 * Mobile list view with infinite scroll for Activity Logs.
 */
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS, ko } from 'date-fns/locale';
import { 
  Clock, 
  Activity,
  User as UserIcon,
  FileText
} from 'lucide-react';
import { 
  ResourceMobileList,
  ResourceMobileCard,
  Avatar,
  Badge,
} from '@superapp/ui-kit';
import { cn } from '@superapp/core-logic';
import type { ActivityLog } from '@superapp/shared-types';
import { ActivityLogMobileCardSkeletonList } from './ActivityLogMobileCardSkeleton';

interface ActivityLogWithUser extends Omit<ActivityLog, 'expand'> {
  expand?: {
    user?: {
      name?: string;
      avatar?: string;
      email?: string;
    };
  };
}

interface ActivityLogMobileListProps {
  /** All logs to display */
  logs: ActivityLogWithUser[];
  /** Whether there are more items to load */
  hasNextPage: boolean;
  /** Whether currently fetching next page */
  isFetchingNextPage: boolean;
  /** Callback to fetch next page */
  fetchNextPage: () => void | Promise<void>;
  /** Whether initial loading */
  isLoading: boolean;
}

export function ActivityLogMobileList({
  logs,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
}: ActivityLogMobileListProps) {
  const { t, i18n } = useTranslation(['activity_logs', 'uikit']);

  // Get Locale for date formatting
  const getLocale = () => {
    switch (i18n.language) {
      case 'vi': return vi;
      case 'ko': return ko;
      default: return enUS;
    }
  };

  // Status/Action Color Mapping
  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'update': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'delete': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'login': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'logout': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };
  
  return (
    <ResourceMobileList<ActivityLogWithUser>
      items={logs}
      keyExtractor={(item) => item.id}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      isLoading={isLoading}
      skeleton={<ActivityLogMobileCardSkeletonList count={5} />}
      renderItem={(log, index) => {
        const actionColor = getActionColor(log.action);
        
        return (
          <ResourceMobileCard
            key={log.id}
            id={log.id}
            index={index}
            icon={
              <div className="w-12 h-12 flex-shrink-0">
                {log.expand?.user ? (
                   <Avatar 
                     src={log.expand.user.avatar} 
                     name={log.expand.user.name} 
                     className="w-12 h-12 rounded-full ring-2 ring-background" 
                   />
                ) : (
                   <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                     <UserIcon className="w-6 h-6 text-muted-foreground" />
                   </div>
                )}
              </div>
            }
            statusConfig={{
              icon: Clock,
              color: 'text-muted-foreground',
              bgColor: 'bg-muted/50'
            }}
            title={(
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground truncate flex-1">
                    {log.expand?.user?.name || t('uikit:unknown')}
                  </h3>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0 bg-muted/50 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(log.created), { addSuffix: true, locale: getLocale() })}
                  </span>
                </div>
                {log.expand?.user?.email && (
                  <p className="text-sm text-muted-foreground truncate opacity-80 leading-none mt-1">
                    {log.expand.user.email}
                  </p>
                )}
              </div>
            )}
            infoRows={[
              {
                icon: Activity,
                label: t('activity_logs:table.action'),
                value: (
                  <Badge className={cn("text-xs capitalize border shadow-none", actionColor)}>
                     {t(`activity_logs:actions.${log.action}`)}
                  </Badge>
                ),
                iconBgColor: 'bg-muted/30',
                iconColor: 'text-muted-foreground'
              },
              {
                icon: Activity,
                label: t('activity_logs:table.resource'),
                value: (
                  <Badge variant="secondary" className="text-xs capitalize inline-flex items-center gap-1">
                     <Activity className="w-3 h-3 opacity-70" />
                     {t(`activity_logs:resources.${log.resource}`)}
                  </Badge>
                ),
                iconBgColor: 'bg-muted/30',
                iconColor: 'text-muted-foreground'
              },
              {
                icon: FileText,
                label: t('uikit:form.description'),
                value: log.message,
                iconBgColor: 'bg-muted/30',
                iconColor: 'text-muted-foreground'
              }
            ]}
          />
        );
      }}
    />
  );
}
