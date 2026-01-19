import { Skeleton } from '@/components/common';

/**
 * MarkdownPageMobileCardSkeleton Component
 * 
 * Skeleton loading state for MarkdownPageMobileCard.
 */
export function MarkdownPageMobileCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-border p-4 space-y-4 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="pt-1">
          <Skeleton className="w-5 h-5 rounded" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Metadata */}
          <div className="flex gap-2">
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Status Badge */}
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-3 border-t border-border">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

/**
 * Multiple skeletons for loading state
 */
export function MarkdownPageMobileCardSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <MarkdownPageMobileCardSkeleton key={i} />
      ))}
    </div>
  );
}
