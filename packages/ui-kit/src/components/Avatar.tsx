/**
 * Avatar Component
 * Display user avatar with image or initials fallback
 * Follows Shadcn UI standards
 */

import * as React from 'react';
import { cn } from '../utils';

// ============================================================================
// Types
// ============================================================================

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string | null;
  /** User name for initials fallback */
  name?: string;
  /** Avatar size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Alt text for image */
  alt?: string;
}

// ============================================================================
// Constants
// ============================================================================

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
} as const;

const bgColors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
] as const;

// ============================================================================
// Utilities
// ============================================================================

function getInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getHashColor(name?: string): string {
  if (!name) return 'bg-gray-400 dark:bg-gray-600';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % bgColors.length;
  return bgColors[index] ?? 'bg-gray-400 dark:bg-gray-600';
}

// ============================================================================
// Component
// ============================================================================

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, name, size = 'md', alt, className, ...props }, ref) => {
    const initials = React.useMemo(() => getInitials(name), [name]);
    const bgColor = React.useMemo(() => getHashColor(name), [name]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden rounded-full',
          sizeClasses[size],
          !src && bgColor,
          !src && 'text-white font-medium',
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';
