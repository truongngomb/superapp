import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

/**
 * SortPopup Component
 *
 * A compact sort button that shows a popup with sort options when clicked.
 * Replaces SortBar to save horizontal space.
 */
export function SortPopup({
  columns,
  currentSort,
  onSort,
  className,
}: SortPopupProps) {
  const { t } = useTranslation(['common']);
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleSortClick = (field: string) => {
    onSort(field);
    // Don't close popup immediately to allow cycling through sort orders
  };

  // Get active sort label for button
  const activeColumn = columns.find((col) => col.field === currentSort.field);
  const hasActiveSort = currentSort.order !== null;

  return (
    <div className={cn('relative', className)}>
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={() => { setIsOpen(!isOpen); }}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cn(hasActiveSort && 'border-primary text-primary')}
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

      {isOpen && (
        <div
          ref={popupRef}
          className={cn(
            'absolute top-full right-0 mt-2 z-50',
            'min-w-[180px] py-1',
            'bg-background border border-border rounded-lg shadow-xl',
            'animate-in fade-in-0 zoom-in-95 duration-100'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-3 py-2 border-b border-border">
            <span className="text-xs font-medium text-muted uppercase tracking-wide">
              {t('common:sort_by', { defaultValue: 'Sort by' })}
            </span>
          </div>
          {columns.map((col) => {
            const isActive = currentSort.field === col.field;
            const order = isActive ? currentSort.order : null;

            return (
              <button
                key={col.field}
                type="button"
                role="menuitem"
                onClick={() => { handleSortClick(col.field); }}
                className={cn(
                  'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left',
                  'hover:bg-surface-hover transition-colors',
                  isActive && 'bg-primary/5 text-primary'
                )}
              >
                <span className="flex items-center gap-2">
                  {isActive && <Check className="w-4 h-4" />}
                  {!isActive && <span className="w-4" />}
                  {col.label}
                </span>
                {order === 'asc' && (
                  <ChevronUp className="w-4 h-4 text-primary" />
                )}
                {order === 'desc' && (
                  <ChevronDown className="w-4 h-4 text-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
