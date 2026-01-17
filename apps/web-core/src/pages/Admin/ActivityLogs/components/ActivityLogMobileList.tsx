/**
 * ActivityLogMobileList Component
 * 
 * Mobile list view with infinite scroll for Activity Logs.
 */
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { ActivityLog } from '@superapp/shared-types';
import { ActivityLogMobileCard } from './ActivityLogMobileCard';
import { ActivityLogMobileCardSkeletonList } from './ActivityLogMobileCardSkeleton';

interface ActivityLogMobileListProps {
  /** All logs to display */
  logs: ActivityLog[];
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
  const { t } = useTranslation('common');
  
  // IntersectionObserver for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px', // Trigger 100px before reaching bottom
  });

  // Trigger fetch when scrolling into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Initial loading state
  if (isLoading && logs.length === 0) {
    return <ActivityLogMobileCardSkeletonList count={5} />;
  }

  return (
    <div className='grid gap-4'>
      {/* Cards List */}
      <AnimatePresence mode="popLayout">
        {logs.map((log, index) => (
          <ActivityLogMobileCard
            key={log.id}
            log={log}
            index={index}
          />
        ))}
      </AnimatePresence>

      {/* Infinite Scroll Trigger & Loading Indicator */}
      <div
        ref={loadMoreRef}
        className="flex items-center justify-center py-4"
      >
        {isFetchingNextPage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{t('loading')}</span>
          </motion.div>
        ) : hasNextPage ? (
          // Invisible trigger zone
          <div className="h-4" />
        ) : logs.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm">{t('list.end_of_list')}</span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
