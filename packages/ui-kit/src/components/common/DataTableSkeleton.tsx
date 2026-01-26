import { Skeleton } from '../Skeleton';
import { cn } from '../../utils';

export interface DataTableSkeletonColumn {
  /** Width or flex value for the column (e.g. '100px', '2fr') */
  width?: string;
  /** Type of skeleton to render */
  type?: 'checkbox' | 'circle' | 'text' | 'badge' | 'actions' | 'avatar-text';
  /** Optional alignment */
  align?: 'left' | 'center' | 'right';
  /** Optional mobile visibility */
  hideOnMobile?: boolean;
  /** Custom skeleton class */
  className?: string;
}

interface DataTableSkeletonProps {
  /** CSS Grid template columns string (e.g. "48px 100px 1fr 120px") */
  gridTemplateColumns: string;
  /** Definitions for each column's skeleton type */
  columns: DataTableSkeletonColumn[];
  /** Number of rows to show (default: 5) */
  rowCount?: number;
  /** Height of each row (default: "56px") */
  rowHeight?: string;
  /** Additional class for container */
  className?: string;
  /** Show header skeleton? (default: true) */
  showHeader?: boolean;
}

export function DataTableSkeleton({
  gridTemplateColumns,
  columns,
  rowCount = 5,
  rowHeight = "56px",
  className,
  showHeader = true,
}: DataTableSkeletonProps) {
  
  const renderColumnSkeleton = (col: DataTableSkeletonColumn) => {
    switch (col.type) {
      case 'checkbox':
        return <Skeleton className="w-4 h-4 rounded" />;
      case 'circle':
        return <Skeleton className="w-8 h-8 rounded-full" />;
      case 'badge':
        return <Skeleton className="h-5 w-16 rounded-full" />;
      case 'actions':
        return (
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-8 h-8 rounded-md" />
          </div>
        );
      case 'avatar-text':
        return (
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        );
      case 'text':
      default:
        return <Skeleton className={cn("h-4 w-full max-w-[80%]", col.className)} />;
    }
  };

  return (
    <div className={cn("w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm flex flex-col", className)}>
      {/* Header Skeleton */}
      {showHeader && (
        <div 
          className="bg-muted/30 border-b border-border w-full hidden md:grid"
          style={{ display: 'grid', gridTemplateColumns }}
        >
          {columns.map((col, idx) => (
            <div 
              key={idx} 
              className={cn(
                "px-4 py-3 flex items-center",
                col.align === 'center' && "justify-center",
                col.align === 'right' && "justify-end",
                col.hideOnMobile && "hidden md:flex"
              )}
            >
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      )}

      {/* Body Skeleton */}
      <div className="divide-y divide-border/50">
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="items-center border-b border-border/50 last:border-0 bg-background"
            style={{ 
              display: 'grid', 
              gridTemplateColumns,
              height: rowHeight 
            }}
          >
            {columns.map((col, colIndex) => (
              <div 
                key={colIndex} 
                className={cn(
                  "px-4 flex items-center h-full",
                  col.align === 'center' && "justify-center",
                  col.align === 'right' && "justify-end",
                  col.hideOnMobile && "hidden md:flex"
                )}
              >
                {renderColumnSkeleton(col)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
