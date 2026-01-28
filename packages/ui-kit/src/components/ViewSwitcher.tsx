import { List, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils';
import { ViewMode } from '@superapp/shared-types';

interface ViewSwitcherProps {
  value: ViewMode;
  onChange: (view: ViewMode) => void;
  className?: string;
}

/**
 * ViewSwitcher Component
 * 
 * Toggle between list and table view modes.
 */
export function ViewSwitcher({ value, onChange, className }: ViewSwitcherProps) {
  const { t } = useTranslation('uikit');

  return (
    <div className={cn('flex items-center gap-1 bg-muted/20 rounded-lg p-1', className)}>
      <button
        type="button"
        onClick={() => { onChange('list'); }}
        className={cn(
          'p-2 rounded-md transition-colors',
          value === 'list'
            ? 'bg-background text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
        )}
        title={t('view_mode.list')}
        aria-label={t('view_mode.list')}
        aria-pressed={value === 'list'}
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => { onChange('table'); }}
        className={cn(
          'p-2 rounded-md transition-colors',
          value === 'table'
            ? 'bg-background text-primary shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
        )}
        title={t('view_mode.table')}
        aria-label={t('view_mode.table')}
        aria-pressed={value === 'table'}
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  );
}
