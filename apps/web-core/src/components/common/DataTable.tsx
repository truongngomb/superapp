import { useMemo, memo, useEffect, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender,
  ColumnDef,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Checkbox } from '@superapp/ui-kit';
import { cn } from '@/utils';
import { List } from 'react-window';
import { motion } from 'framer-motion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
const VirtualList = List as any;

// Re-export specific type for usage in other files
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableColumn<T> = ColumnDef<T, any>;

// Legacy compatibility for the plan mostly, but encouraging use of DataTableColumn
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Column<T> = ColumnDef<T, any> & {
  // Add legacy props if strictly needed during migration, otherwise prefer standard ColumnDef
  className?: string; // used for cell styling
  align?: 'left' | 'center' | 'right';
  hidden?: boolean;
  width?: string | number;
};

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyExtractor: (item: T) => string;
  
  // Selection
  selectedIds?: string[];
  onSelectAll?: (checked: boolean) => void;
  onSelectOne?: (id: string, checked: boolean) => void;
  
  // Sorting (Server-side)
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  
  // Pagination (For Order number)
  currentPage?: number;
  perPage?: number;

  isLoading?: boolean;
  emptyMessage?: string;
  showSelectAll?: boolean;
}

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
  "use no memo";
  const { t } = useTranslation('common');

  // Convert legacy selection props to TanStack rowSelection state
  const rowSelection = useMemo(() => {
    if (!selectedIds) return {};
    return selectedIds.reduce<RowSelectionState>((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});
  }, [selectedIds]);

  // Convert legacy sort props to TanStack sorting state
  const sorting = useMemo<SortingState>(() => {
    if (!sortColumn) return [];
    return [{
      id: sortColumn,
      desc: sortDirection === 'desc',
    }];
  }, [sortColumn, sortDirection]);

  // Define Selection Column and Order Column
  const tableColumns = useMemo<DataTableColumn<T>[]>(() => {
    const cols = [...columns];
    
    // Filter hidden columns (legacy support compatibility)
    // We cast to any to access the custom legacy props if defined in the standard ColumnDef alias
     
    const visibleCols = cols.filter(c => !(c as Column<T>).hidden);

    // Prepend Selection Column if needed
    if (onSelectAll || onSelectOne) {
      visibleCols.unshift({
        id: 'selection',
        size: 48,
        minSize: 48,
        maxSize: 48,
        header: ({ table }) => (
          showSelectAll && onSelectAll ? (
            <div className="flex items-center justify-center h-full w-full">
              <Checkbox
                checked={table.getIsAllRowsSelected()}
                triState={table.getIsSomeRowsSelected()}
                onChange={(checked) => { onSelectAll(checked); }}
                aria-label={t('data_table.select_all')}
              />
            </div>
          ) : null
        ),
        cell: ({ row }) => (
          onSelectOne ? (
            <div className="flex items-center justify-center h-full w-full">
              <Checkbox
                checked={row.getIsSelected()}
                onChange={(checked) => { onSelectOne(row.id, checked); }}
                aria-label={t('data_table.select_row')}
              />
            </div>
          ) : null
        ),
      });
    }

    // Prepend Order Column
    visibleCols.splice((onSelectAll || onSelectOne) ? 1 : 0, 0, {
      id: 'order',
      size: 48,
      header: () => (
        <div className="text-center w-full min-w-full">{t('order')}</div>
      ),
      cell: ({ row }) => {
        const orderNumber = (currentPage - 1) * perPage + row.index + 1;
        return <div className="text-center text-muted-foreground w-full">{orderNumber}</div>;
      }
    });

    return visibleCols;
  }, [columns, onSelectAll, onSelectOne, showSelectAll, currentPage, perPage, t]);

  // eslint-disable-next-line
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      rowSelection,
    },
    getRowId: keyExtractor,
    onSortingChange: (updater) => {
      // Handles server-side sorting callback
      if (typeof updater !== 'function' && updater.length > 0 && onSort) {
        const sort = updater[0];
        if (sort) onSort(sort.id);
      }
    },
    defaultColumn: {
      enableSorting: false, // Match legacy behavior: opt-in sorting
    },
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  });

  const { rows } = table.getRowModel();

  // Construct grid-template-columns string
  // Logic: 
  // - defaultSize (150) -> minmax(150px, 1fr)
  // - explicit width string from legacy prop "width" -> use as is
  // - explicit width string like "200px" or "20%" -> use as is
  // - derived number size -> use px
  const flatHeaders = table.getFlatHeaders();
  const refinedGridTemplateColumns = useMemo(() => {
    return flatHeaders.map((header) => {
        const colDef = header.column.columnDef as Column<T>;
        const legacyWidth = colDef.width; 
        
        // Priority: legacy string width > TanStack number size
        if (typeof legacyWidth === 'string') {
           // check if it's purely number in string
           if (!isNaN(Number(legacyWidth))) return `${legacyWidth}px`;
           return legacyWidth;
        }
        
        // If legacyWidth is number, it might be fr or px. 
        // In the previous Codebase, width=2 was treated as 2fr.
        // width=200 was treated as 200px (likely).
        // Let's use logic: if < 20 assumption implies 'fr', but risk is high.
        // Better to check defined Width logic in previous file:
        // "Support custom width (e.g. '20%', '200px', 2 for 2fr)"
        
        if (typeof legacyWidth === 'number') {
           if (legacyWidth <= 10) return `${String(legacyWidth)}fr`; // Heuristic: small numbers are fr
           return `${String(legacyWidth)}px`;
        }

        // Fallback to TanStack size
        const size = header.getSize(); 
        if (size === 150) return 'minmax(150px, 1fr)';
        return `${String(size)}px`;
    }).join(' ');
  }, [flatHeaders]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Row = ({ index, style }: { index: number; style: CSSProperties; [key: string]: any }) => {
    const row = rows[index];
    if (!row) return null;

    return (
      <div
        className={cn(
          "items-center hover:bg-muted/5 transition-colors group border-b border-border/50 bg-background",
          row.getIsSelected() && "bg-primary/5"
        )}
        style={{
          ...style,
          display: 'grid',
          gridTemplateColumns: refinedGridTemplateColumns,
        }}
        role="row"
        aria-rowindex={index + 1}
      >
        {row.getVisibleCells().map((cell) => {
            const colDef = cell.column.columnDef as Column<T>;
           return (
            <div
              key={cell.id}
              className={cn(
                "px-4 text-sm h-full flex items-center",
                cell.column.id !== 'actions' && "truncate",
                colDef.align === 'center' && "justify-center text-center",
                colDef.align === 'right' && "justify-end text-right",
                colDef.className
              )}
              role="cell"
              style={{ width: '100%' }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          );
        })}
      </div>
    );
  };

  const useVirtualization = data.length > 50;

  useEffect(() => {
    // Force re-render only if needed by virtualization or resize
  }, [refinedGridTemplateColumns]);

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
            gridTemplateColumns: refinedGridTemplateColumns,
          }}
        >
          {table.getFlatHeaders().map((header) => {
            const isSortable = header.column.getCanSort();
            const colDef = header.column.columnDef as Column<T>;
            
            return (
              <div
                key={header.id}
                className={cn(
                  "px-4 py-3 text-sm font-semibold text-muted tracking-wider whitespace-nowrap overflow-hidden select-none h-full flex items-center",
                  isSortable && "cursor-pointer hover:bg-muted/5",
                  colDef.className
                )}
                onClick={isSortable ? () => onSort?.(header.column.id) : undefined}
                role="columnheader"
              >
                 <div className={cn(
                  "flex items-center gap-1 w-full",
                   colDef.align === 'center' && "justify-center",
                   colDef.align === 'right' && "justify-end"
                 )}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {isSortable && (
                    <span className="ml-1">
                      {{
                        asc: <ChevronUp className="w-4 h-4 text-primary" />,
                        desc: <ChevronDown className="w-4 h-4 text-primary" />,
                      }[header.column.getIsSorted() as string] ?? <ChevronsUpDown className="w-4 h-4 text-muted-foreground/50" />}
                    </span>
                  )}
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="w-full flex-1 min-w-full overflow-x-auto" role="rowgroup">
        {isLoading ? (
          <div className="divide-y divide-border/50">
            {Array.from({ length: 5 }).map((_, i) => (
               <div key={i} className="p-4 flex gap-4">
                  {/* Generic Loading Skeleton row */}
                  {Array.from({ length: Math.min(columns.length, 5) }).map((_, j) => (
                     <div key={j} className="h-6 bg-muted/10 animate-pulse rounded flex-1" />
                  ))}
               </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground border-b border-border/50">
             {emptyMessage || t('list.empty', { entities: t('data_table.items') })}
          </div>
        ) : useVirtualization ? (
          <VirtualList
            style={{ height: 500, width: '100%' }}
            rowCount={rows.length}
            rowHeight={56}
            rowComponent={Row}
            rowProps={{}}
          />
        ) : (
          <div className="divide-y divide-border/50">
            {rows.map((row) => (
               <div
                key={row.id}
                className={cn(
                  "items-center hover:bg-muted/5 transition-colors group h-[56px] border-b border-border/50 last:border-0",
                  row.getIsSelected() && "bg-primary/5"
                )}
                style={{
                  display: 'grid',
                  gridTemplateColumns: refinedGridTemplateColumns,
                }}
                role="row"
              >
                {row.getVisibleCells().map((cell) => {
                   const colDef = cell.column.columnDef as Column<T>;
                   return (
                    <div
                      key={cell.id}
                      className={cn(
                        "px-4 text-sm h-full flex items-center",
                        cell.column.id !== 'actions' && "truncate",
                        colDef.align === 'center' && "justify-center text-center",
                        colDef.align === 'right' && "justify-end text-right",
                        colDef.className
                      )}
                      role="cell"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const DataTable = memo(DataTableInner) as typeof DataTableInner;
