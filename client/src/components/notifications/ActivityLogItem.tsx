/**
 * Activity Log Item Component
 * Displays a single activity log with styling based on action type
 */
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS, vi, ko } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { 
  PlusCircle, 
  Edit3, 
  Trash2, 
  LogIn, 
  LogOut, 
  User,
  Package,
  Shield,
  Activity
} from 'lucide-react';
import { cn } from '@/utils';
import type { ActivityLog } from '@/types';

interface ActivityLogItemProps {
  log: ActivityLog;
  onClick?: (log: ActivityLog) => void;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'create': return <PlusCircle className="w-4 h-4 text-emerald-500" />;
    case 'update': return <Edit3 className="w-4 h-4 text-blue-500" />;
    case 'delete': return <Trash2 className="w-4 h-4 text-rose-500" />;
    case 'login': return <LogIn className="w-4 h-4 text-indigo-500" />;
    case 'logout': return <LogOut className="w-4 h-4 text-slate-500" />;
    default: return <Activity className="w-4 h-4 text-slate-400" />;
  }
};

const getResourceIcon = (resource: string) => {
  switch (resource) {
    case 'users': return <User className="w-3 h-3" />;
    case 'categories': return <Package className="w-3 h-3" />;
    case 'roles': return <Shield className="w-3 h-3" />;
    default: return <Activity className="w-3 h-3" />;
  }
};

export const ActivityLogItem: React.FC<ActivityLogItemProps> = ({ log, onClick }) => {
  const { i18n } = useTranslation();
  
  // Determine locale for date-fns
  const dateLocale = i18n.language === 'vi' ? vi : i18n.language === 'ko' ? ko : enUS;
  
  const timeAgo = formatDistanceToNow(new Date(log.created), { 
    addSuffix: true,
    locale: dateLocale 
  });

  const userName = log.expand?.user?.name || log.user || 'Unknown User';
  const avatar = log.expand?.user?.avatar;

  return (
    <div 
      className={cn(
        "flex gap-3 p-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer group rounded-xl border border-transparent hover:border-slate-100",
      )}
      onClick={() => { onClick?.(log); }}
    >
      <div className="relative flex-shrink-0">
        {avatar ? (
          <img src={avatar} alt={userName} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-medium border border-indigo-100">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-50">
          {getActionIcon(log.action)}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="text-sm font-medium text-slate-900 truncate">
            {userName}
          </p>
          <span className="text-[10px] text-slate-400 whitespace-nowrap pt-0.5">
            {timeAgo}
          </span>
        </div>
        
        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
          {log.message}
        </p>
        
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium uppercase tracking-wider">
            {getResourceIcon(log.resource)}
            <span>{log.resource}</span>
          </div>
          {log.recordId && (
            <span className="text-[10px] text-slate-300 font-mono">
              #{log.recordId.slice(-6)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
