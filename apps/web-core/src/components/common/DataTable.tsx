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
  width?: string | number; // Support custom width (e.g. "20%", "200px", 2 for 2fr)
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
import { motion } from 'framer-motion';

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

  // Calculate Grid Template
  const gridTemplateColumns = useMemo(() => {
    const parts: string[] = [];
    
    // Selection Column
    if (onSelectAll || onSelectOne) parts.push('48px');
    
    // Order Column
    parts.push('48px');
    
    // Data Columns
    visibleColumns.forEach(col => {
      if (typeof col.width === 'number') {
        parts.push(`${String(col.width)}fr`);
      } else if (typeof col.width === 'string') {
        parts.push(col.width);
      } else {
        // Default to minmax for responsiveness, or simple 1fr
        // 'minmax(150px, 1fr)' helps prevent squishing, but might cause overflow. 
        // Let's stick to 1fr as default to fill space evenly like flex.
        parts.push('minmax(150px, 1fr)');
      }
    });

    return parts.join(' ');
  }, [onSelectAll, onSelectOne, visibleColumns]);

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
        style={{
          ...style,
          display: 'grid',
          gridTemplateColumns,
        }}
        className={cn(
          "items-center hover:bg-muted/5 transition-colors group border-b border-border/50 bg-background",
          isSelected && "bg-primary/5"
        )}
        role="row"
        aria-rowindex={index + 1}
      >
        {/* Selection Cell */}
        {(onSelectAll || onSelectOne) && (
          <div className="px-2 flex items-center justify-center h-full" role="cell">
            {onSelectOne && (
              <Checkbox
                checked={!!isSelected}
                onChange={(checked) => { onSelectOne(id, checked); }}
                aria-label={t('data_table.select_row')}
              />
            )}
          </div>
        )}

        {/* Order Cell */}
        <div className="px-2 text-center text-sm text-muted-foreground h-full flex items-center justify-center" role="cell">
          {orderNumber}
        </div>

        {/* Data Cells */}
        {visibleColumns.map((col) => (
          <div
            key={col.key}
            className={cn(
              "px-4 text-sm truncate h-full flex items-center",
              col.align === 'center' && "justify-center text-center",
              col.align === 'right' && "justify-end text-right",
              col.className
            )}
            role="cell"
          >
            {col.render ? col.render(item, index) : ((item as Record<string, unknown>)[col.key] as React.ReactNode)}
          </div>
        ))}
      </div>
    );
  };

  const useVirtualization = data.length > 50;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full rounded-lg border border-border bg-card shadow-sm overflow-hidden flex flex-col"
      role="table"
      aria-label={t('data_table.table_label')}
      aria-rowcount={data.length}
    >
      {/* Header */}
      <div 
        className="bg-background text-muted-foreground border-b border-border sticky top-0 z-10 w-full min-w-full overflow-hidden"
        role="rowgroup"
      >
        <div 
          className="items-center w-full min-w-full" 
          role="row"
          style={{
            display: 'grid',
            gridTemplateColumns,
          }}
        >
          {/* Selection Column */}
          {(onSelectAll || onSelectOne) && (
            <div className="px-2 py-3 flex items-center justify-center h-full border-r border-transparent" role="columnheader">
               {showSelectAll && onSelectAll && (
                <Checkbox
                  checked={allSelected}
                  triState={isIndeterminate}
                  onChange={onSelectAll}
                  aria-label={t('data_table.select_all')}
                />
              )}
            </div>
          )}

          {/* Order Column */}
          <div className="px-2 py-3 text-center text-sm font-semibold text-muted tracking-wider h-full flex items-center justify-center" role="columnheader">
            {t('order')}
          </div>

          {/* Data Columns */}
          {visibleColumns.map((col) => (
            <div
              key={col.key}
              className={cn(
                "px-4 py-3 text-sm font-semibold text-muted tracking-wider whitespace-nowrap overflow-hidden select-none h-full flex items-center",
                col.sortable && "cursor-pointer hover:bg-muted/5",
                col.className
              )}
              onClick={() => col.sortable && onSort?.(col.key)}
              role="columnheader"
              aria-sort={sortColumn === col.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <div className={cn(
                "flex items-center gap-1 w-full",
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
      <div className="w-full flex-1 min-w-full overflow-x-auto" role="rowgroup">
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
             {emptyMessage || t('list.empty', { entities: t('data_table.items') })}
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
            {data.map((item: T, index: number) => {
              const id = keyExtractor(item);
              const isSelected = selectedIds?.includes(id);
              const orderNumber = (currentPage - 1) * perPage + index + 1;

              return (
                <div
                  key={id}
                  className={cn(
                    "items-center hover:bg-muted/5 transition-colors group h-[56px] border-b border-border/50 last:border-0",
                    isSelected && "bg-primary/5"
                  )}
                  style={{
                    display: 'grid',
                    gridTemplateColumns,
                  }}
                  role="row"
                  aria-rowindex={index + 1}
                >
                  {/* Selection Cell */}
                  {(onSelectAll || onSelectOne) && (
                    <div className="px-2 flex items-center justify-center h-full" role="cell">
                      {onSelectOne && (
                        <Checkbox
                          checked={!!isSelected}
                          onChange={(checked) => { onSelectOne(id, checked); }}
                          aria-label={t('data_table.select_row')}
                        />
                      )}
                    </div>
                  )}

                  {/* Order Cell */}
                  <div className="px-2 text-center text-sm text-muted-foreground h-full flex items-center justify-center" role="cell">
                    {orderNumber}
                  </div>

                  {/* Data Cells */}
                  {visibleColumns.map((col) => (
                    <div
                      key={col.key}
                      className={cn(
                        "px-4 text-sm truncate h-full flex items-center",
                        col.align === 'center' && "justify-center text-center",
                        col.align === 'right' && "justify-end text-right",
                        col.className
                      )}
                      role="cell"
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
    </motion.div>
  );
}

// Memoize the whole component to prevent unnecessary internal re-renders
export const DataTable = memo(DataTableInner) as typeof DataTableInner;
