/**
 * Notification Center Component
 * A popover/panel to display recent activity logs
 */
import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, X, RefreshCw } from 'lucide-react';
import { useActivityLogContext, useOnClickOutside } from '@/hooks';
import { ActivityLogItem } from './ActivityLogItem';
import { Button } from '@/components/common';
import { cn } from '@/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['notifications', 'common']);
  const { logs, isLoading, error, refetch, resetUnreadCount, loadMore, hasMore, isLoadingMore } = useActivityLogContext();
  
  const containerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(containerRef, () => {
    if (isOpen) onClose();
  });

  // Reset unread count when opening
  React.useEffect(() => {
    if (isOpen) {
      resetUnreadCount();
    }
  }, [isOpen, resetUnreadCount]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-16 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-96 max-h-[calc(100vh-100px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <Bell className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                  {t('notifications:title')}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => { void refetch(); }}
                  className="p-2 h-8 w-8"
                  disabled={isLoading}
                  title={t('common:refresh')}
                >
                  <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="p-2 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar min-h-[300px]">
              {isLoading && logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400 animate-pulse">{t('common:loading')}</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="p-3 bg-red-50 rounded-full mb-3 text-red-500">
                    <BellOff className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                  <Button 
                    variant="link"
                    size="sm"
                    onClick={() => { void refetch(); }}
                    className="mt-4 text-xs font-semibold"
                  >
                    {t('common:retry')}
                  </Button>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-4 text-slate-300">
                    <Bell className="w-12 h-12" />
                  </div>
                  <h4 className="text-slate-900 dark:text-slate-200 font-medium mb-1">
                    {t('notifications:empty_title')}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                    {t('notifications:empty_desc')}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log) => (
                    <ActivityLogItem key={log.id} log={log} />
                  ))}
                  
                  {/* Load More Button */}
                  {hasMore && (
                    <div className="pt-2 pb-1 px-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => { void loadMore(); }}
                        disabled={isLoadingMore}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 h-8"
                      >
                        {isLoadingMore ? (
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-3 border-2 border-slate-300 dark:border-slate-600 border-t-indigo-600 rounded-full animate-spin" />
                             <span>{t('common:loading')}</span>
                          </div>
                        ) : (
                          t('common:load_more')
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {logs.length > 0 && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                <Button 
                  variant="ghost" 
                  fullWidth 
                  size="sm"
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-white dark:hover:bg-slate-800"
                  onClick={() => {
                    onClose();
                    void navigate('/admin/activity-logs');
                  }}
                >
                  {t('notifications:view_all')}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


