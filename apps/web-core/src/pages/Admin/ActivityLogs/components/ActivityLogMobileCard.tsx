/**
 * ActivityLogMobileCard Component
 * 
 * Mobile card view for Activity Logs.
 */
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS, ko } from 'date-fns/locale';
import { 
  Clock, 
  Activity,
  User as UserIcon
} from 'lucide-react';
import { Avatar, Badge } from '@/components/common';
import { cn } from '@/utils';
import type { ActivityLog } from '@superapp/shared-types';

interface ActivityLogWithUser extends Omit<ActivityLog, 'expand'> {
  expand?: {
    user?: {
      name?: string;
      avatar?: string;
      email?: string;
    };
  };
}

interface ActivityLogMobileCardProps {
  log: ActivityLogWithUser;
  index: number;
}

export function ActivityLogMobileCard({
  log,
  index,
}: ActivityLogMobileCardProps) {
  const { t, i18n } = useTranslation(['activity_logs', 'common']);
  
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

  const actionColor = getActionColor(log.action);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="card border shadow-xl"
    >
      {/* ============ HEADER SECTION ============ */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar (w-12 like Category Icon) */}
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

          {/* User Name & Time */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-0.5">
               <div className="flex items-center gap-2">
                 <span className="text-muted-foreground font-bold text-sm">#{index + 1}</span>
                 <h3 className="font-bold text-lg text-foreground truncate flex-1">
                   {log.expand?.user?.name || t('common:unknown')}
                 </h3>
                 <span className="text-xs text-muted-foreground flex items-center gap-1 flex-shrink-0 bg-muted/50 px-2 py-0.5 rounded-full">
                   <Clock className="w-3 h-3" />
                   {formatDistanceToNow(new Date(log.created), { addSuffix: true, locale: getLocale() })}
                 </span>
               </div>
               {/* Email/Subtitle */}
               {log.expand?.user?.email && (
                 <p className="text-sm text-muted-foreground truncate opacity-80">
                   {log.expand.user.email}
                 </p>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ INFO ROWS SECTION (Like Category Details) ============ */}
      <div className="mx-4 mb-4">
        {/* Action Row */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2">
           <div className="flex items-center gap-3 text-muted-foreground w-24 flex-shrink-0">
              <span className="text-sm font-medium">{t('activity_logs:table.action')}:</span>
           </div>
           <div className="flex-1 text-right">
              <Badge className={cn("text-xs capitalize border shadow-none", actionColor)}>
                 {t(`activity_logs:actions.${log.action}`, { defaultValue: log.action })}
              </Badge>
           </div>
        </div>

        {/* Resource Row */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2">
           <div className="flex items-center gap-3 text-muted-foreground w-24 flex-shrink-0">
              <span className="text-sm font-medium">{t('activity_logs:table.resource')}:</span>
           </div>
           <div className="flex-1 text-right">
              <Badge variant="secondary" className="text-xs capitalize inline-flex items-center gap-1">
                 <Activity className="w-3 h-3 opacity-70" />
                 {t(`activity_logs:resources.${log.resource}`, { defaultValue: log.resource })}
              </Badge>
           </div>
        </div>

         {/* Message Row */}
         <div className="bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2">
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              {log.message}
            </p>
         </div>
      </div>
    </motion.div>
  );
}
