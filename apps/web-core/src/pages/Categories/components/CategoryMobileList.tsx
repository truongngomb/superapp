/**
 * CategoryMobileList Component
 * 
 * Mobile list view with infinite scroll functionality.
 * Uses IntersectionObserver to detect when user scrolls near bottom.
 */
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { Category } from '@superapp/shared-types';
import { CategoryMobileCard } from './CategoryMobileCard';
import { CategoryMobileCardSkeletonList } from './CategoryMobileCardSkeleton';

interface CategoryMobileListProps {
  /** All categories to display */
  categories: Category[];
  /** Whether there are more items to load */
  hasNextPage: boolean;
  /** Whether currently fetching next page */
  isFetchingNextPage: boolean;
  /** Callback to fetch next page */
  fetchNextPage: () => void | Promise<void>;
  /** Whether initial loading */
  isLoading: boolean;
  /** Selected category IDs */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelect?: (id: string, checked: boolean) => void;
  /** Callback to edit category */
  onEdit: (category: Category) => void;
  /** Callback to delete category */
  onDelete: (id: string) => void;
  /** Callback to restore category */
  onRestore?: (id: string) => void;
  /** Callback to duplicate category */
  onDuplicate?: (category: Category) => void;
}

export function CategoryMobileList({
  categories,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  selectedIds = [],
  onSelect,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
}: CategoryMobileListProps) {
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
  if (isLoading && categories.length === 0) {
    return <CategoryMobileCardSkeletonList count={5} />;
  }

  return (
    <div className='grid gap-4'>
      {/* Cards List */}
      <AnimatePresence mode="popLayout">
        {categories.map((category, index) => (
          <CategoryMobileCard
            key={category.id}
            category={category}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onDuplicate={onDuplicate}
            isSelected={selectedIds.includes(category.id)}
            onSelect={onSelect}
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
        ) : categories.length > 0 ? (
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
