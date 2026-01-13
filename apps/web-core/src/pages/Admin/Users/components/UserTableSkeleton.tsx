import { Skeleton } from '@/components/common';

/**
 * UserTableSkeleton Component
 * 
 * Skeleton loading state for UserTable. Matches the structure of UserTable.tsx.
 */
export function UserTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border/50 bg-muted/30">
            <th className="p-4 w-10">
              <Skeleton className="w-4 h-4 rounded" />
            </th>
            <th className="w-12 p-4 text-center">
              <Skeleton className="h-4 w-8 mx-auto" />
            </th>
            <th className="p-4">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="p-4">
              <Skeleton className="h-4 w-12" />
            </th>
            <th className="w-32 p-4">
              <Skeleton className="h-4 w-14" />
            </th>
            <th className="p-4 hidden md:table-cell">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="p-4 text-right">
              <Skeleton className="h-4 w-16 ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className="p-4">
                <Skeleton className="w-4 h-4 rounded" />
              </td>
              <td className="p-4 text-center">
                <Skeleton className="h-4 w-6 mx-auto" />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </td>
              <td className="p-4">
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              <td className="p-4 hidden md:table-cell">
                <Skeleton className="h-4 w-20" />
              </td>
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
