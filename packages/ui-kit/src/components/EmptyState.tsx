import { LucideIcon } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../utils';

export interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon;
  /** Title of the empty state */
  title: string;
  /** Description or sub-message */
  description?: string;
  /** Action button text */
  actionText?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Additional classes for the container */
  className?: string;
}

/**
 * Standardized Empty State component for lists and grids.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-muted/5',
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 transition-transform hover:scale-105">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      {description && <p className="text-muted-foreground max-w-sm mb-6">{description}</p>}
      {actionText && onAction && (
        <Button onClick={onAction} className="shadow-lg hover:shadow-primary/20">
          {actionText}
        </Button>
      )}
    </div>
  );
}
