import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from '@superapp/ui-kit';
import { cn } from '@/utils';

export interface Column<T> {
  key: string;
  header: ReactNode | string;
  render?: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  
  // Selection
  selectedIds?: string[];
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: string, checked: boolean) => void;
  
  // Sorting
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  
  // Pagination (Order number calculation)
  currentPage?: number;
  perPage?: number;

  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  selectedIds,
  onSelectAll,
  onSelectOne,
  sortColumn,
  sortDirection,
  onSort,
  currentPage = 1,
  perPage = 10,
  isLoading,
  emptyMessage,
}: DataTableProps<T>) {
  const { t } = useTranslation('common');

  const visibleColumns = columns.filter(col => !col.hidden);
  const allSelected = data.length > 0 && selectedIds?.length === data.length;
  const isIndeterminate = !!(selectedIds && selectedIds.length > 0 && selectedIds.length < data.length);

  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return <ChevronsUpDown className="w-4 h-4 ml-1 text-muted-foreground/50" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1 text-primary" />
      : <ChevronDown className="w-4 h-4 ml-1 text-primary" />;
  };

  return (
    <div className="w-full overflow-auto rounded-lg border border-border bg-card shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-background text-muted-foreground">
          <tr>
            {/* Selection Column */}
            {(onSelectAll || onSelectOne) && (
              <th className="w-12 px-4 py-3 align-middle">
                 {onSelectAll && (
                  <Checkbox
                    checked={allSelected}
                    triState={isIndeterminate}
                    onChange={onSelectAll}
                  />
                )}
              </th>
            )}

            {/* Order Column */}
            <th className="w-12 px-4 py-3 text-center text-sm font-semibold text-muted tracking-wider align-middle">
              {t('order')}
            </th>

            {/* Data Columns */}
            {visibleColumns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-sm font-semibold text-muted tracking-wider align-middle whitespace-nowrap",
                  col.sortable && "cursor-pointer hover:bg-muted/50 select-none",
                  col.align === 'center' && "text-center",
                  col.align === 'right' && "text-right",
                  col.className
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className={cn(
                  "flex items-center gap-1",
                  col.align === 'center' && "justify-center",
                  col.align === 'right' && "justify-end"
                )}>
                  {col.header}
                  {col.sortable && renderSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {isLoading ? (
            // Skeleton Loading State
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={visibleColumns.length + 2} className="p-4">
                  <div className="h-10 bg-muted/10 animate-pulse rounded" />
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            // Empty State
            <tr>
              <td colSpan={visibleColumns.length + 2} className="p-8 text-center text-muted-foreground">
                 {emptyMessage || t('list.empty', { entities: t('items', { defaultValue: 'Items' }) })}
              </td>
            </tr>
          ) : (
            // Data Rows
            data.map((item, index) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds?.includes(id);
              const orderNumber = (currentPage - 1) * perPage + index + 1;

              return (
                <tr
                  key={id}
                  className={cn(
                    "hover:bg-muted/50 transition-colors group",
                    isSelected && "bg-primary/5"
                  )}
                >
                  {/* Selection Cell */}
                  {(onSelectAll || onSelectOne) && (
                    <td className="w-12 px-4 py-3 align-middle">
                      {onSelectOne && (
                        <Checkbox
                          checked={!!isSelected}
                          onChange={(checked) => { onSelectOne(id, checked); }}
                        />
                      )}
                    </td>
                  )}

                  {/* Order Cell */}
                  <td className="px-4 py-3 text-center text-sm text-muted-foreground align-middle">
                    {orderNumber}
                  </td>

                  {/* Data Cells */}
                  {visibleColumns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-sm align-middle",
                        col.align === 'center' && "text-center",
                        col.align === 'right' && "text-right",
                        col.className
                      )}
                    >
                      {col.render ? col.render(item, index) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
