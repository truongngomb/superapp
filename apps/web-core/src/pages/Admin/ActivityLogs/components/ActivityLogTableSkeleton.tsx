import { Skeleton } from '@/components/common';

/**
 * ActivityLogTableSkeleton Component
 * 
 * Skeleton loading state for ActivityLogTable. Matches CSS Grid structure.
 * Grid Template: Order(48px) User(250px) Action(140px) Resource(140px) Details(1.5fr) Time(180px)
 */
export function ActivityLogTableSkeleton() {
  const gridTemplateColumns = "48px 250px 140px 140px 1.5fr 200px";

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm flex flex-col">
      {/* Header */}
      <div 
        className="bg-background text-muted-foreground border-b border-border w-full hidden md:grid"
        style={{ display: 'grid', gridTemplateColumns }}
      >
        {/* Order */}
        <div className="px-2 py-3 flex items-center justify-center">
           <Skeleton className="h-4 w-8" />
        </div>
        {/* User */}
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-12" />
        </div>
        {/* Action */}
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-14" />
        </div>
        {/* Resource */}
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-16" />
        </div>
        {/* Details */}
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-14" />
        </div>
        {/* Time */}
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-12" />
        </div>
      </div>

      {/* Body */}
      <div className="divide-y divide-border/50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i} 
            className="items-center h-[56px] border-b border-border/50 last:border-0 bg-background"
            style={{ display: 'grid', gridTemplateColumns }}
          >
            {/* Order */}
            <div className="px-2 flex items-center justify-center h-full">
              <Skeleton className="h-4 w-6" />
            </div>
            {/* User */}
            <div className="px-4 flex items-center h-full">
               <div className="flex items-center gap-3">
                 <Skeleton className="w-8 h-8 rounded-full" />
                 <Skeleton className="h-4 w-24" />
               </div>
            </div>
            {/* Action */}
            <div className="px-4 flex items-center h-full">
               <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            {/* Resource */}
            <div className="px-4 flex items-center h-full">
               <Skeleton className="h-4 w-20" />
            </div>
            {/* Details */}
            <div className="px-4 flex items-center h-full">
               <Skeleton className="h-4 w-48" />
            </div>
            {/* Time */}
            <div className="px-4 flex items-center h-full">
               <div className="flex items-center gap-1.5">
                 <Skeleton className="w-3.5 h-3.5 rounded" />
                 <Skeleton className="h-4 w-20" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
