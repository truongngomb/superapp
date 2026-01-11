/**
 * Toggle/Switch Component
 * 
 * Reusable toggle switch for boolean state (e.g., isActive).
 * Used across forms: CategoryForm, RoleForm, UserForm.
 */
import { cn } from '@/utils';

interface ToggleProps {
  /** Current checked state */
  checked: boolean;
  /** Callback when toggle is clicked */
  onChange: (checked: boolean) => void;
  /** Optional label text */
  label?: string;
  /** Hide label on mobile screens (portrait view) */
  hideLabelOnMobile?: boolean;
  /** Optional description text */
  description?: string;
  /** Disable the toggle */
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, hideLabelOnMobile = false, description, disabled }: ToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface rounded-lg gap-2">
      {(label || description) && (
        <div className={cn(hideLabelOnMobile && 'hidden sm:inline')}>
          {label && <label className={cn('font-medium text-foreground')}>{label}</label>}
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => { onChange(!checked); }}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
