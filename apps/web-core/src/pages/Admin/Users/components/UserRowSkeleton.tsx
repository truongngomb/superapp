import { Skeleton } from '@/components/common';

/**
 * UserRowSkeleton Component
 * 
 * Skeleton loading state for UserRow (list view). Based on CategorySkeleton pattern.
 */
export function UserRowSkeleton() {
  return (
    <div className="px-1 py-1">
      <div className="card p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Checkbox placeholder */}
          <Skeleton className="w-5 h-5 rounded" />
          
          {/* Avatar placeholder */}
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

          {/* Mobile Title placeholder */}
          <div className="md:hidden flex-1 min-w-0">
            <Skeleton className="h-5 w-2/3" />
          </div>
        </div>
        
        {/* Main Content placeholder */}
        <div className="flex-1 min-w-0 w-full md:w-auto pl-14 md:pl-0 -mt-2 md:mt-0 space-y-2">
          {/* Desktop Title placeholder */}
          <div className="hidden md:block">
            <Skeleton className="h-5 w-1/3" />
          </div>
          {/* Email placeholder */}
          <Skeleton className="h-4 w-1/2" />
          {/* Role badges placeholder */}
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
        
        {/* Actions placeholder */}
        <div className="flex items-center justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}
