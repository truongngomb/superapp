import { ReactNode, useMemo, memo, type CSSProperties } from 'react';
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
  showSelectAll?: boolean;
}

import { List, type RowComponentProps } from 'react-window';

function DataTableInner<T>({
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
  showSelectAll = false,
}: DataTableProps<T>) {
  const { t } = useTranslation('common');

  const visibleColumns = useMemo(() => columns.filter(col => !col.hidden), [columns]);
  const allSelected = data.length > 0 && selectedIds?.length === data.length;
  const isIndeterminate = !!(selectedIds && selectedIds.length > 0 && selectedIds.length < data.length);

  const renderSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return <ChevronsUpDown className="w-4 h-4 ml-1 text-muted-foreground/50" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1 text-primary" />
      : <ChevronDown className="w-4 h-4 ml-1 text-primary" />;
  };

  const Row = ({ index, style }: RowComponentProps) => {
    const item = data[index] as T;
    const id = keyExtractor(item);
    const isSelected = selectedIds?.includes(id);
    const orderNumber = (currentPage - 1) * perPage + index + 1;

    return (
      <div 
        style={style}
        className={cn(
          "flex items-center hover:bg-muted/5 transition-colors group border-b border-border/50",
          isSelected && "bg-primary/5"
        )}
      >
        {/* Selection Cell */}
        {(onSelectAll || onSelectOne) && (
          <div className="w-12 px-4 flex items-center justify-center shrink-0">
            {onSelectOne && (
              <Checkbox
                checked={!!isSelected}
                onChange={(checked) => { onSelectOne(id, checked); }}
              />
            )}
          </div>
        )}

        {/* Order Cell */}
        <div className="w-12 px-4 text-center text-sm text-muted-foreground shrink-0 overflow-hidden">
          {orderNumber}
        </div>

        {/* Data Cells */}
        {visibleColumns.map((col) => (
          <div
            key={col.key}
            className={cn(
              "flex-1 px-4 text-sm truncate",
              col.align === 'center' && "text-center",
              col.align === 'right' && "text-right",
              col.className
            )}
            style={{ 
              minWidth: col.key === 'actions' ? '120px' : '0',
              flexBasis: col.key === 'actions' ? '0' : 'auto'
            }}
          >
            {col.render ? col.render(item, index) : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
          </div>
        ))}
      </div>
    );
  };

  const useVirtualization = data.length > 50;

  return (
    <div className="w-full rounded-lg border border-border bg-card shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex bg-background text-muted-foreground border-b border-border sticky top-0 z-10 w-full overflow-x-auto min-w-full">
        <div className="flex w-full items-center min-w-[800px]">
          {/* Selection Column */}
          {(onSelectAll || onSelectOne) && (
            <div className="w-12 px-4 py-3 flex items-center justify-center shrink-0">
               {showSelectAll && onSelectAll && (
                <Checkbox
                  checked={allSelected}
                  triState={isIndeterminate}
                  onChange={onSelectAll}
                />
              )}
            </div>
          )}

          {/* Order Column */}
          <div className="w-12 px-4 py-3 text-center text-sm font-semibold text-muted tracking-wider shrink-0 overflow-hidden">
            {t('order')}
          </div>

          {/* Data Columns */}
          {visibleColumns.map((col) => (
            <div
              key={col.key}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-semibold text-muted tracking-wider whitespace-nowrap overflow-hidden select-none",
                col.sortable && "cursor-pointer hover:bg-muted/5",
                col.className
              )}
              style={{ 
                minWidth: col.key === 'actions' ? '120px' : '0',
                flexBasis: col.key === 'actions' ? '0' : 'auto'
              }}
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
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="w-full flex-1 min-w-[800px] overflow-x-auto">
        {isLoading ? (
          <div className="divide-y divide-border/50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4">
                <div className="h-10 bg-muted/10 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border-b border-border/50">
             {emptyMessage || t('list.empty', { entities: t('items', { defaultValue: 'Items' }) })}
          </div>
        ) : useVirtualization ? (
          <List
            rowCount={data.length}
            rowHeight={56}
            rowComponent={Row}
            rowProps={{}}
            style={{ height: 500, width: '100%' } as CSSProperties}
          />
        ) : (
          <div className="divide-y divide-border/50">
            {data.map((item, index) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds?.includes(id);
              const orderNumber = (currentPage - 1) * perPage + index + 1;

              return (
                <div
                  key={id}
                  className={cn(
                    "flex items-center hover:bg-muted/5 transition-colors group h-[56px]",
                    isSelected && "bg-primary/5"
                  )}
                >
                  {/* Selection Cell */}
                  {(onSelectAll || onSelectOne) && (
                    <div className="w-12 px-4 flex items-center justify-center shrink-0">
                      {onSelectOne && (
                        <Checkbox
                          checked={!!isSelected}
                          onChange={(checked) => { onSelectOne(id, checked); }}
                        />
                      )}
                    </div>
                  )}

                  {/* Order Cell */}
                  <div className="w-12 px-4 text-center text-sm text-muted-foreground shrink-0 overflow-hidden">
                    {orderNumber}
                  </div>

                  {/* Data Cells */}
                  {visibleColumns.map((col) => (
                    <div
                      key={col.key}
                      className={cn(
                        "flex-1 px-4 text-sm truncate",
                        col.align === 'center' && "text-center",
                        col.align === 'right' && "text-right",
                        col.className
                      )}
                      style={{ 
                        minWidth: col.key === 'actions' ? '120px' : '0',
                        flexBasis: col.key === 'actions' ? '0' : 'auto'
                      }}
                    >
                      {col.render ? col.render(item, index) : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Memoize the whole component to prevent unnecessary internal re-renders
export const DataTable = memo(DataTableInner) as typeof DataTableInner;
