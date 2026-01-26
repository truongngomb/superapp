import React, { forwardRef } from 'react';
import { cn } from '../utils';

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The text content or children */
  children: React.ReactNode;
  /** Custom gradient classes (optional) */
  gradientClassName?: string;
  /** Whether to use secondary color in gradient */
  useSecondary?: boolean;
}

/**
 * A component for rendering text with a beautiful gradient effect.
 * Uses bg-clip-text and text-transparent.
 */
export const GradientText = forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ children, className, gradientClassName, useSecondary = true, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'bg-clip-text text-transparent bg-gradient-to-r from-primary',
          useSecondary ? 'to-secondary' : 'to-primary/60',
          gradientClassName,
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

GradientText.displayName = 'GradientText';
