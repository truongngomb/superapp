import { Skeleton } from '@/components/common';

export function CategoryTableSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-background text-muted-foreground">
          <tr>
            {/* Selection */}
            <th className="w-12 px-4 py-3 align-middle">
               <Skeleton className="w-4 h-4 rounded" />
            </th>
            {/* Order */}
            <th className="w-12 px-4 py-3 text-center align-middle">
               <Skeleton className="h-4 w-8 mx-auto" />
            </th>
            {/* Icon */}
            <th className="w-12 px-4 py-3 align-middle">
               <Skeleton className="w-8 h-8 rounded-lg" />
            </th>
            {/* Name */}
            <th className="px-4 py-3 align-middle">
               <Skeleton className="h-4 w-24" />
            </th>
            {/* Description */}
            <th className="px-4 py-3 align-middle hidden md:table-cell">
               <Skeleton className="h-4 w-32" />
            </th>
            {/* Status */}
            <th className="w-32 px-4 py-3 align-middle">
               <Skeleton className="h-4 w-16" />
            </th>
            {/* Actions */}
            <th className="w-32 px-4 py-3 align-middle text-right">
               <Skeleton className="h-4 w-16 ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-t border-border">
              {/* Selection */}
              <td className="w-12 px-4 py-3 align-middle">
                <Skeleton className="w-4 h-4 rounded" />
              </td>
              {/* Order */}
              <td className="w-12 px-4 py-3 text-center align-middle">
                <Skeleton className="h-4 w-6 mx-auto" />
              </td>
              {/* Icon */}
              <td className="w-12 px-4 py-3 align-middle">
                <Skeleton className="w-8 h-8 rounded-lg" />
              </td>
              {/* Name */}
              <td className="px-4 py-3 align-middle">
                <Skeleton className="h-4 w-32" />
              </td>
              {/* Description */}
              <td className="px-4 py-3 align-middle hidden md:table-cell">
                <Skeleton className="h-4 w-48" />
              </td>
              {/* Status */}
              <td className="w-32 px-4 py-3 align-middle">
                <Skeleton className="h-5 w-16 rounded-full" />
              </td>
              {/* Actions */}
              <td className="w-32 px-4 py-3 align-middle">
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
