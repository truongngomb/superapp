import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/utils';
import type { SortConfig, SortColumn } from '@/types';

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSort: SortConfig;
  onSort: (field: string) => void;
  className?: string;
}

/**
 * SortableHeader Component
 * 
 * A clickable header that toggles between ascending, descending, and no sort.
 */
export function SortableHeader({
  label,
  field,
  currentSort,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = currentSort.field === field;
  const order = isActive ? currentSort.order : null;

  const handleClick = () => {
    onSort(field);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
        'hover:bg-surface-hover',
        isActive ? 'text-primary bg-primary/10' : 'text-muted',
        className
      )}
    >
      <span>{label}</span>
      {order === 'asc' ? (
        <ChevronUp className="w-4 h-4" />
      ) : order === 'desc' ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronsUpDown className="w-4 h-4 opacity-50" />
      )}
    </button>
  );
}

interface SortBarProps {
  columns: SortColumn[];
  currentSort: SortConfig;
  onSort: (field: string) => void;
  className?: string;
}

/**
 * SortBar Component
 * 
 * A horizontal bar of sortable column headers.
 */
export function SortBar({
  columns,
  currentSort,
  onSort,
  className,
}: SortBarProps) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {columns.map((col) => (
        <SortableHeader
          key={col.field}
          label={col.label}
          field={col.field}
          currentSort={currentSort}
          onSort={onSort}
        />
      ))}
    </div>
  );
}
