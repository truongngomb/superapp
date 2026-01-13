/**
 * Checkbox Component
 * 
 * Supports 2-state (checked/unchecked) and 3-state (checked/unchecked/indeterminate) modes.
 * The indeterminate state is used for "select all" scenarios where only some items are selected.
 */
import { useEffect, useRef } from 'react';
import { cn } from '../utils';

type CheckboxState = boolean | 'indeterminate';

interface CheckboxProps {
  /** Checkbox state: true (checked), false (unchecked), or 'indeterminate' (partial selection) */
  checked: CheckboxState;
  /** Callback when checkbox is clicked */
  onChange: (checked: boolean) => void;
  /** Enable 3-state mode (includes indeterminate state) */
  triState?: boolean;
  /** Optional label text */
  label?: string;
  /** Hide label on mobile screens (portrait view) */
  hideLabelOnMobile?: boolean;
  /** Disable the checkbox */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Unique id for the checkbox (for accessibility) */
  id?: string;
}

const sizeClasses = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function Checkbox({
  checked,
  onChange,
  triState = false,
  label,
  hideLabelOnMobile = false,
  disabled = false,
  className,
  size = 'md',
  id,
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle indeterminate state via ref (not controllable via JSX attribute)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = checked === 'indeterminate';
    }
  }, [checked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    
    if (triState && checked === 'indeterminate') {
      // From indeterminate, clicking checks all
      onChange(true);
    } else {
      onChange(e.target.checked);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isChecked = checked === true;

  return (
    <label
      className={cn(
        'inline-flex items-center gap-2 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        id={id}
        type="checkbox"
        checked={isChecked}
        disabled={disabled}
        onChange={handleChange}
        className={cn(
          sizeClasses[size],
          'rounded border-gray-300 dark:border-gray-600',
          'text-primary focus:ring-primary focus:ring-offset-0',
          'bg-white dark:bg-gray-700',
          'transition-colors duration-150',
          'cursor-pointer',
          disabled && 'cursor-not-allowed'
        )}
      />
      {label && (
        <span className={cn(
          'text-foreground text-sm',
          hideLabelOnMobile && 'hidden sm:inline'
        )}>
          {label}
        </span>
      )}
    </label>
  );
}
