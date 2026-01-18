
import { Skeleton } from '@/components/common';

/**
 * RoleTableSkeleton Component
 * 
 * Skeleton loading state for RoleTable. Matches the structure of DataTable (CSS Grid).
 * Grid Template matches DataTable: Selection(48px) Name(1.5fr) Description(2fr) Permissions(150px) Status(120px) Actions(160px)
 */
export function RoleTableSkeleton() {
  const gridTemplateColumns = "48px 1.5fr 2fr 150px 120px 160px";

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm flex flex-col">
      {/* Header */}
      <div 
        className="bg-background text-muted-foreground border-b border-border w-full hidden md:grid"
        style={{ display: 'grid', gridTemplateColumns }}
      >
        {/* Selection */}
        <div className="px-2 py-3 flex items-center justify-center border-r border-transparent">
           <Skeleton className="w-4 h-4 rounded" />
        </div>

        {/* Name */}
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-32" />
        </div>

        {/* Description */}
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-48" />
        </div>

        {/* Permissions */}
        <div className="px-4 py-3 hidden md:flex items-center">
           <Skeleton className="h-4 w-24" />
        </div>

        {/* Status */}
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-16" />
        </div>

        {/* Actions */}
        <div className="px-4 py-3 flex items-center justify-end">
           <Skeleton className="h-4 w-16 ml-auto" />
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
            {/* Selection */}
            <div className="px-2 flex items-center justify-center h-full">
              <Skeleton className="w-4 h-4 rounded" />
            </div>

            {/* Name */}
            <div className="px-4 flex items-center h-full">
               <div className="flex items-center gap-2">
                 <Skeleton className="w-4 h-4 rounded" />
                 <Skeleton className="h-4 w-32" />
               </div>
            </div>

            {/* Description */}
            <div className="px-4 flex items-center h-full">
               <Skeleton className="h-4 w-64" />
            </div>

            {/* Permissions */}
            <div className="px-4 items-center h-full hidden md:flex">
               <Skeleton className="h-5 w-24 rounded-full" />
            </div>

            {/* Status */}
            <div className="px-4 flex items-center h-full">
               <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            {/* Actions */}
            <div className="px-4 flex items-center justify-end h-full">
              <div className="flex items-center gap-1">
                <Skeleton className="w-8 h-8 rounded-md" />
                <Skeleton className="w-8 h-8 rounded-md" />
                <Skeleton className="w-8 h-8 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
