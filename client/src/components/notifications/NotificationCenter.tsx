/**
 * Notification Center Component
 * A popover/panel to display recent activity logs
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Bell, BellOff, X, RefreshCw } from 'lucide-react';
import { useActivityLogs } from '@/hooks';
import { ActivityLogItem } from './ActivityLogItem';
import { Button } from '@/components/common';
import { cn } from '@/utils';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { logs, isLoading, error, refetch, resetUnreadCount } = useActivityLogs(20);

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
          {/* Backdrop for mobile or global close */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-40 transition-all"
          />
          
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-16 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-96 max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Bell className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-800">
                  {t('notifications.title', 'Hoạt động gần đây')}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => { void refetch(); }}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                  disabled={isLoading}
                  title={t('common.refresh', 'Làm mới')}
                >
                  <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar min-h-[300px]">
              {isLoading && logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                  <p className="text-sm text-slate-400 animate-pulse">{t('common.loading', 'Đang tải...')}</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="p-3 bg-red-50 rounded-full mb-3 text-red-500">
                    <BellOff className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                  <button 
                    onClick={() => { void refetch(); }}
                    className="mt-4 text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    {t('common.retry', 'Thử lại')}
                  </button>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="p-4 bg-slate-50 rounded-full mb-4 text-slate-300">
                    <Bell className="w-12 h-12" />
                  </div>
                  <h4 className="text-slate-900 font-medium mb-1">
                    {t('notifications.empty_title', 'Chưa có thông báo')}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
                    {t('notifications.empty_desc', 'Các hoạt động hệ thống sẽ xuất hiện tại đây.')}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log) => (
                    <ActivityLogItem key={log.id} log={log} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {logs.length > 0 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <Button 
                  variant="ghost" 
                  fullWidth 
                  size="sm"
                  className="text-indigo-600 hover:text-indigo-700 hover:bg-white"
                >
                  {t('notifications.view_all', 'Xem tất cả lịch sử')}
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};


