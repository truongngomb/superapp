import { Skeleton } from '../Skeleton';

interface ResourceCardSkeletonProps {
  infoRowsCount?: number;
  actionsCount?: number;
}

export function ResourceCardSkeleton({ 
  infoRowsCount = 1, 
  actionsCount = 3 
}: ResourceCardSkeletonProps) {
  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border shadow-xl">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Checkbox placeholder */}
          <Skeleton className="w-5 h-5 rounded" />
          
          {/* Icon/Avatar - w-12 */}
          <Skeleton className="w-12 h-12 rounded-full" />
          
          {/* Title Area */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-4" />
              <Skeleton className="w-32 h-6" />
            </div>
          </div>
          
          {/* Status Icon Area */}
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* Info Rows */}
      <div className="mx-4 mb-4 space-y-2">
        {Array.from({ length: infoRowsCount }).map((_, i) => (
          <div key={i} className="flex items-center bg-muted/30 rounded p-2">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-20 h-4" />
            </div>
            <Skeleton className="ml-auto w-32 h-4" />
          </div>
        ))}
      </div>

      {/* Bottom Buttons */}
      <div className="flex border-t border-border bg-muted/5">
        {Array.from({ length: actionsCount }).map((_, i) => (
          <div 
            key={i} 
            className="flex-1 py-3.5 flex items-center justify-center gap-2 border-r last:border-r-0 border-border"
          >
            <Skeleton className="w-4 h-4" />
            <Skeleton className="w-12 h-4 hidden xs:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Multiple skeletons for loading state list
 */
export function ResourceCardSkeletonList({ count = 5, infoRowsCount = 1, actionsCount = 3 }: { count?: number, infoRowsCount?: number, actionsCount?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ResourceCardSkeleton key={i} infoRowsCount={infoRowsCount} actionsCount={actionsCount} />
      ))}
    </div>
  );
}
