/**
 * ActivityLogMobileCardSkeleton Component
 * 
 * Skeleton loading state for Activity Log Mobile Cards.
 */
import { Skeleton } from '@/components/common';

export function ActivityLogMobileCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Skeleton className="w-12 h-12 rounded-full" />
          
          {/* Name & Time */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <Skeleton className="w-32 h-3" />
          </div>
        </div>
      </div>

      {/* Info Rows */}
      <div className="mx-4 mb-4">
        {/* Action Row */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2">
           <div className="flex items-center gap-3">
              <Skeleton className="w-20 h-4" />
           </div>
           <Skeleton className="ml-auto w-16 h-5 rounded-full" />
        </div>
        
        {/* Resource Row */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2">
           <div className="flex items-center gap-3">
              <Skeleton className="w-20 h-4" />
           </div>
           <Skeleton className="ml-auto w-24 h-5 rounded-full" />
        </div>

        {/* Message Row */}
        <div className="bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2 space-y-2">
           <Skeleton className="w-full h-4" />
           <Skeleton className="w-3/4 h-4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Multiple skeletons for loading state
 */
export function ActivityLogMobileCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ActivityLogMobileCardSkeleton key={i} />
      ))}
    </div>
  );
}
