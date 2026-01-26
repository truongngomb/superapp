import React, { useEffect, ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils';

interface ResourceMobileListProps<T> {
  /** All items to display */
  items: T[];
  /** Key extractor for items */
  keyExtractor: (item: T) => string;
  /** Render function for each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Skeleton list component or count */
  skeleton: ReactNode | number;
  /** Whether there are more items to load */
  hasNextPage: boolean;
  /** Whether currently fetching next page */
  isFetchingNextPage: boolean;
  /** Callback to fetch next page */
  fetchNextPage: () => void | Promise<void>;
  /** Whether initial loading */
  isLoading: boolean;
  /** Optional empty state component */
  emptyState?: ReactNode;
  /** Additional container class */
  className?: string;
  /** Custom translation namespace */
  tNamespace?: string;
}

export function ResourceMobileList<T>({
  items,
  keyExtractor,
  renderItem,
  skeleton,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  emptyState,
  className,
  tNamespace = 'uikit',
}: ResourceMobileListProps<T>) {
  const { t } = useTranslation(tNamespace);
  
  // IntersectionObserver for infinite scroll
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px', // Trigger earlier for smoother experience
  });

  // Trigger fetch when scrolling into view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Initial loading state
  if (isLoading && items.length === 0) {
    if (typeof skeleton === 'number') {
      // If count provided, we don't have the specific skeleton here
      // This is a bit tricky if we want to stay generic.
      // Better to require a skeleton component.
      return <div className="space-y-4">...</div>; 
    }
    return <>{skeleton}</>;
  }

  // Empty state
  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        {emptyState || (
          <>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
               <span className="text-2xl">📭</span>
            </div>
            <p>{t('common.no_data', { defaultValue: 'No items found' })}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', className)}>
      {/* Cards List */}
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <React.Fragment key={keyExtractor(item)}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
      </AnimatePresence>

      {/* Infinite Scroll Trigger & Loading Indicator */}
      <div
        ref={loadMoreRef}
        className="flex items-center justify-center py-6"
      >
        {isFetchingNextPage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">{t('common.loading', { defaultValue: 'Loading more...' })}</span>
          </motion.div>
        ) : hasNextPage ? (
          // Invisible trigger zone
          <div className="h-8 w-full" />
        ) : items.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/50"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {t('common.end_of_list', { defaultValue: 'End of list' })}
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
