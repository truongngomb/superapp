import { Skeleton } from '@/components/common';

export function CategoryTableSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-background text-muted-foreground">
          <tr>
            <th className="w-12 h-12 px-4 shadow-none border-none"></th>
            <th className="w-12 h-12 px-4 text-center font-medium">
              <Skeleton className="h-4 w-8 mx-auto" />
            </th>
            <th className="w-12 h-12 px-4 shadow-none border-none"></th>
            <th className="h-12 px-4 text-left font-medium">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="h-12 px-4 text-left font-medium hidden md:table-cell">
              <Skeleton className="h-4 w-24" />
            </th>
            <th className="w-32 h-12 px-4 text-left font-medium">
              <Skeleton className="h-4 w-16" />
            </th>
            <th className="w-32 h-12 px-4 text-right font-medium">
              <Skeleton className="h-4 w-16" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-t border-border">
              <td className="p-4 align-middle">
                <Skeleton className="w-4 h-4 rounded" />
              </td>
              <td className="p-4 align-middle text-center">
                <Skeleton className="h-4 w-6 mx-auto" />
              </td>
              <td className="p-4 align-middle">
                <Skeleton className="w-8 h-8 rounded-lg" />
              </td>
              <td className="p-4 align-middle">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="p-4 align-middle hidden md:table-cell">
                <Skeleton className="h-4 w-48" />
              </td>
              <td className="p-4 align-middle">
                <Skeleton className="h-6 w-20 rounded-full" />
              </td>
              <td className="p-4 align-middle">
                <div className="flex justify-end gap-2">
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
