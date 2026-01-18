/**
 * UserMobileCardSkeleton Component
 * 
 * Skeleton loading state for User Mobile Cards.
 */
import { Skeleton } from '@/components/common';

export function UserMobileCardSkeleton() {
  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <Skeleton className="w-5 h-5 rounded" />
          
          {/* Avatar - w-12 */}
          <Skeleton className="w-12 h-12 rounded-full" />
          
          {/* Name */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-4" />
              <Skeleton className="w-28 h-6" />
            </div>
          </div>
          
          {/* Status Icon */}
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Info Rows */}
      <div className="mx-4 mb-4">
        {/* Email Row */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2">
           <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-20 h-4" />
           </div>
           <Skeleton className="ml-auto w-32 h-4" />
        </div>
        
        {/* Roles Row */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-700/30 rounded mb-2 p-2">
           <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-20 h-4" />
           </div>
           <div className="ml-auto flex gap-1">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-12 h-6 rounded-full" />
           </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex border-t border-border">
        <div className="flex-1 py-3.5 flex items-center justify-center gap-2 border-r border-border">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-10 h-4" />
        </div>
        <div className="flex-1 py-3.5 flex items-center justify-center gap-2 border-r border-border">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-14 h-4" />
        </div>
        <div className="flex-1 py-3.5 flex items-center justify-center gap-2">
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-10 h-4" />
        </div>
      </div>
    </div>
  );
}

/**
 * Multiple skeletons for loading state
 */
export function UserMobileCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <UserMobileCardSkeleton key={i} />
      ))}
    </div>
  );
}
