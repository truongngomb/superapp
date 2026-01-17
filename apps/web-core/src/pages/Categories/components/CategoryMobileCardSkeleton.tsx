/**
 * CategoryMobileCardSkeleton Component
 * 
 * Skeleton loading state matching Pokemon Scanner design with icon status.
 */
import { Skeleton } from '@/components/common';

export function CategoryMobileCardSkeleton() {
  return (
    <div className="bg-[#1a1f2e] rounded-2xl overflow-hidden border border-[#2a3142] shadow-xl">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <Skeleton className="w-5 h-5 rounded bg-[#2a3142]" />
          
          {/* Icon - w-12 */}
          <Skeleton className="w-12 h-12 rounded-full bg-[#2a3142]" />
          
          {/* Name */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-4 bg-[#2a3142]" />
              <Skeleton className="w-28 h-6 bg-[#2a3142]" />
            </div>
          </div>
          
          {/* Status Icon */}
          <Skeleton className="w-10 h-10 rounded-full bg-[#2a3142]" />
        </div>
      </div>

      {/* Info Rows */}
      <div className="mx-4 mb-4">
        <div className="flex items-center py-3 border-b border-[#2a3142]">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full bg-[#2a3142]" />
            <Skeleton className="w-20 h-4 bg-[#2a3142]" />
          </div>
          <Skeleton className="ml-auto w-32 h-4 bg-[#2a3142]" />
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex border-t border-[#2a3142]">
        <div className="flex-1 py-3.5 flex items-center justify-center gap-2 border-r border-[#2a3142]">
          <Skeleton className="w-4 h-4 bg-[#2a3142]" />
          <Skeleton className="w-10 h-4 bg-[#2a3142]" />
        </div>
        <div className="flex-1 py-3.5 flex items-center justify-center gap-2 border-r border-[#2a3142]">
          <Skeleton className="w-4 h-4 bg-[#2a3142]" />
          <Skeleton className="w-14 h-4 bg-[#2a3142]" />
        </div>
        <div className="flex-1 py-3.5 flex items-center justify-center gap-2">
          <Skeleton className="w-4 h-4 bg-[#2a3142]" />
          <Skeleton className="w-10 h-4 bg-[#2a3142]" />
        </div>
      </div>
    </div>
  );
}

/**
 * Multiple skeletons for loading state
 */
export function CategoryMobileCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryMobileCardSkeleton key={i} />
      ))}
    </div>
  );
}
