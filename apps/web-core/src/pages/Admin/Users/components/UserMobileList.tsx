/**
 * UserMobileList Component
 * 
 * Mobile list view with infinite scroll for Users.
 * Matches CategoryMobileList pattern.
 */
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { User, Role } from '@superapp/shared-types';
import { UserMobileCard } from './UserMobileCard';
import { UserMobileCardSkeletonList } from './UserMobileCardSkeleton';

interface UserMobileListProps {
  /** All users to display */
  users: User[];
  /** Available roles for display mapping */
  roles: Role[];
  /** Whether there are more items to load */
  hasNextPage: boolean;
  /** Whether currently fetching next page */
  isFetchingNextPage: boolean;
  /** Callback to fetch next page */
  fetchNextPage: () => void | Promise<void>;
  /** Whether initial loading */
  isLoading: boolean;
  /** Selected user IDs */
  selectedIds?: string[];
  /** Callback when selection changes */
  onSelect?: (id: string, checked: boolean) => void;
  /** Callback to edit user */
  onEdit: (user: User) => void;
  /** Callback to delete user */
  onDelete: (id: string) => void;
  /** Callback to restore user */
  onRestore?: (id: string) => void;
  /** Callback to assign role */
  onAssignRole: (user: User) => void;
}

export function UserMobileList({
  users,
  roles,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  selectedIds = [],
  onSelect,
  onEdit,
  onDelete,
  onRestore,
  onAssignRole,
}: UserMobileListProps) {
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
  if (isLoading && users.length === 0) {
    return <UserMobileCardSkeletonList count={5} />;
  }

  return (
    <div className='grid gap-4'>
      {/* Cards List */}
      <AnimatePresence mode="popLayout">
        {users.map((user, index) => (
          <UserMobileCard
            key={user.id}
            user={user}
            roles={roles}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onAssignRole={onAssignRole}
            isSelected={selectedIds.includes(user.id)}
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
        ) : users.length > 0 ? (
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
