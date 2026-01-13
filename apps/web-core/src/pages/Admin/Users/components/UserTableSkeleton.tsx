import { Skeleton } from '@/components/common';

/**
 * UserTableSkeleton Component
 * 
 * Skeleton loading state for UserTable. Matches the structure of UserTable.tsx.
 */
export function UserTableSkeleton() {
  return (
    <div className="w-full overflow-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-background text-muted-foreground">
          <tr>
            {/* Selection */}
            <th className="w-10 p-4">
               <Skeleton className="w-4 h-4 rounded" />
            </th>
            {/* Order */}
            <th className="w-12 p-4 text-center">
               <Skeleton className="h-4 w-8 mx-auto" />
            </th>
            {/* User Info (Avatar + Name) */}
            <th className="p-4">
               <Skeleton className="h-4 w-32" />
            </th>
            {/* Roles */}
            <th className="p-4">
               <Skeleton className="h-4 w-20" />
            </th>
            {/* Status */}
            <th className="w-32 p-4">
               <Skeleton className="h-4 w-16" />
            </th>
            {/* Created */}
            <th className="p-4 hidden md:table-cell">
               <Skeleton className="h-4 w-24" />
            </th>
            {/* Actions */}
            <th className="p-4 text-right">
               <Skeleton className="h-4 w-16 ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-t border-border">
              {/* Selection */}
              <td className="p-4">
                <Skeleton className="w-4 h-4 rounded" />
              </td>
              {/* Order */}
              <td className="p-4">
                <Skeleton className="h-4 w-6 mx-auto" />
              </td>
              {/* User Info */}
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </td>
              {/* Roles */}
              <td className="p-4">
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </td>
              {/* Status */}
              <td className="p-4">
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              {/* Created */}
              <td className="p-4 hidden md:table-cell">
                <Skeleton className="h-4 w-24" />
              </td>
              {/* Actions */}
              <td className="p-4">
                <div className="flex items-center justify-end gap-1">
                  <Skeleton className="w-8 h-8 rounded-md" />
                  <Skeleton className="w-8 h-8 rounded-md" />
                  <Skeleton className="w-8 h-8 rounded-md" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
