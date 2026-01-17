/**
 * ActivityLogMobileCardSkeleton Component
 * 
 * Skeleton loading state for Activity Log Mobile Cards.
 */
import { Skeleton } from '@/components/common';

export function ActivityLogMobileCardSkeleton() {
  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Skeleton className="w-10 h-10 rounded-full" />
          
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
      <div className="mx-4 mb-4 p-3 rounded-lg bg-muted/50 space-y-3">
        {/* Badges */}
        <div className="flex gap-2 items-center">
           <Skeleton className="w-16 h-5 rounded-full" />
           <Skeleton className="w-4 h-4" />
           <Skeleton className="w-20 h-5 rounded-full" />
        </div>
        
        {/* Message */}
        <div className="flex items-start gap-3 border-t border-border pt-2">
           <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20 mt-1.5" />
           <Skeleton className="flex-1 h-4" />
        </div>
        <div className="pl-4.5">
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
