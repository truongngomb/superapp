/**
 * Textarea Component
 * Multi-line text input with label and error handling
 */

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils';

// ============================================================================
// Types
// ============================================================================

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Auto-resize based on content */
  autoResize?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, autoResize = false, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg',
            'bg-surface border border-border',
            'text-foreground placeholder:text-muted',
            'transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
            'resize-y min-h-[100px]',
            autoResize && 'resize-none overflow-hidden',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {helperText && !error && <p className="text-sm text-muted">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
