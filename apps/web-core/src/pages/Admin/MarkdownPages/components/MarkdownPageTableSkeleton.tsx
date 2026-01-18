import { Skeleton } from '@/components/common';

/**
 * MarkdownPageTableSkeleton Component
 * 
 * Skeleton loading state for MarkdownPageTable.
 * Grid Template: Selection(48px) Title(300px) position(150px) published(150px) updated(150px) actions(130px)
 */
export function MarkdownPageTableSkeleton() {
  const gridTemplateColumns = "48px 300px 150px 150px 150px 130px";

  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm flex flex-col">
      {/* Header */}
      <div 
        className="bg-background text-muted-foreground border-b border-border w-full hidden md:grid"
        style={{ display: 'grid', gridTemplateColumns }}
      >
        <div className="px-2 py-3 flex items-center justify-center border-r border-transparent">
           <Skeleton className="w-4 h-4 rounded" />
        </div>
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-32" />
        </div>
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-24" />
        </div>
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-20" />
        </div>
        <div className="px-4 py-3 flex items-center">
           <Skeleton className="h-4 w-20" />
        </div>
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
            <div className="px-2 flex items-center justify-center h-full">
              <Skeleton className="w-4 h-4 rounded" />
            </div>
            <div className="px-4 flex items-center h-full">
              <div className="flex items-center gap-3">
                 <Skeleton className="w-8 h-8 rounded" />
                 <div className="flex flex-col gap-1">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-3 w-16" />
                 </div>
              </div>
            </div>
            <div className="px-4 flex items-center h-full">
               <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <div className="px-4 flex items-center h-full">
               <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="px-4 flex items-center h-full">
               <Skeleton className="h-4 w-24" />
            </div>
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
