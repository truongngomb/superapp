import { useTranslation } from 'react-i18next';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ArrowUpDown, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';
import type { SortConfig, SortColumn } from '@superapp/shared-types';

interface SortPopupProps {
  columns: SortColumn[];
  currentSort: SortConfig;
  onSort: (field: string) => void;
  className?: string;
}

export function SortPopup({
  columns,
  currentSort,
  onSort,
  className,
}: SortPopupProps) {
  const { t } = useTranslation(['common']);

  // Get active sort label for button
  const activeColumn = columns.find((col) => col.field === currentSort.field);
  const hasActiveSort = currentSort.order !== null;

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          variant="outline"
          className={cn(hasActiveSort && 'border-primary text-primary', className)}
        >
          <ArrowUpDown className="w-5 h-5" />
          {hasActiveSort && activeColumn && (
            <span className="hidden sm:inline ml-1 text-sm">
              {activeColumn.label}
              {currentSort.order === 'asc' ? (
                <ChevronUp className="w-3 h-3 inline ml-0.5" />
              ) : (
                <ChevronDown className="w-3 h-3 inline ml-0.5" />
              )}
            </span>
          )}
        </Button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          className={cn(
            'z-50 min-w-[180px] overflow-hidden rounded-md border bg-background text-foreground shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
          )}
        >
          <div className="px-3 py-2 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('common:sort_by', { defaultValue: 'Sort by' })}
            </span>
          </div>
          
          <div className="p-1">
            {columns.map((col) => {
              const isActive = currentSort.field === col.field;
              const order = isActive ? currentSort.order : null;

              return (
                <DropdownMenuPrimitive.Item
                  key={col.field}
                  onSelect={() => {
                    onSort(col.field);
                  }}
                  className={cn(
                    'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 dark:focus:bg-gray-800 focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                    isActive && 'bg-gray-100 dark:bg-gray-800 text-accent-foreground'
                  )}
                >
                  <span className="flex items-center gap-2 flex-1">
                    <span className="w-4 flex items-center justify-center">
                       {isActive && <Check className="w-4 h-4" />}
                    </span>
                    {col.label}
                  </span>
                  {order === 'asc' && (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  )}
                  {order === 'desc' && (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </DropdownMenuPrimitive.Item>
              );
            })}
          </div>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
