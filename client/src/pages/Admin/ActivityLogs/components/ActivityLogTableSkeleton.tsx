import { Skeleton } from '@/components/common';

/**
 * ActivityLogTableSkeleton Component
 * 
 * Skeleton loading state for ActivityLogTable. Matches the structure of ActivityLogTable.tsx.
 */
export function ActivityLogTableSkeleton() {
  return (
    <div className="w-full overflow-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-background text-muted-foreground">
          <tr>
            <th className="w-12 h-12 px-4 text-center font-medium">
              <Skeleton className="h-4 w-8 mx-auto" />
            </th>
            <th className="h-12 px-4 text-left font-medium">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="h-12 px-4 text-left font-medium">
              <Skeleton className="h-4 w-14" />
            </th>
            <th className="h-12 px-4 text-left font-medium">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="h-12 px-4 text-left font-medium">
              <Skeleton className="h-4 w-14" />
            </th>
            <th className="h-12 px-4 text-left font-medium">
              <Skeleton className="h-4 w-12" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-t border-border">
              {/* Order column */}
              <td className="p-4 align-middle text-center">
                <Skeleton className="h-4 w-6 mx-auto" />
              </td>
              {/* User column */}
              <td className="p-4 align-middle">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </td>
              {/* Action column */}
              <td className="p-4 align-middle">
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              {/* Resource column */}
              <td className="p-4 align-middle">
                <Skeleton className="h-4 w-20" />
              </td>
              {/* Details column */}
              <td className="p-4 align-middle">
                <Skeleton className="h-4 w-48" />
              </td>
              {/* Time column */}
              <td className="p-4 align-middle">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="w-3.5 h-3.5 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
