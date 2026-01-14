/**
 * ColorPicker Component
 * 
 * Reusable color picker with hex input display and opacity slider.
 * Supports both native color picker and preset color palette modes.
 * Used for color selection in forms like CategoryForm.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Palette, Pipette } from 'lucide-react';
import { cn } from '@/utils';
import { useToast } from '@/context';

// ============================================================================
// Types
// ============================================================================

/** Preset color definition */
export interface PresetColor {
  /** Color value (6 or 8-digit hex) */
  value: string;
  /** Optional display name */
  name?: string;
}

/** Color picker mode */
export type ColorPickerMode = 'picker' | 'presets';

interface ColorPickerProps {
  /** Current color value (6-digit #RRGGBB or 8-digit #RRGGBBAA hex) */
  value: string;
  /** Callback when color changes */
  onChange: (value: string) => void;
  /** Optional label */
  label?: string;
  /** Show hex input field (default: true) */
  showHexInput?: boolean;
  /** Show opacity slider (default: true) */
  showOpacity?: boolean;
  /** Disable the picker */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Color picker mode: 'picker' for native, 'presets' for palette (default: 'picker') */
  mode?: ColorPickerMode;
  /** Allow switching between modes (default: true if presetColors provided) */
  allowModeSwitch?: boolean;
  /** Preset colors for palette mode (uses defaults if not provided) */
  presetColors?: PresetColor[];
}

// ============================================================================
// Default Preset Colors
// ============================================================================

const DEFAULT_PRESET_COLORS: PresetColor[] = [
  // Reds
  { value: '#ef4444', name: 'Red' },
  { value: '#f97316', name: 'Orange' },
  { value: '#f59e0b', name: 'Amber' },
  // Yellows & Greens
  { value: '#eab308', name: 'Yellow' },
  { value: '#84cc16', name: 'Lime' },
  { value: '#22c55e', name: 'Green' },
  { value: '#10b981', name: 'Emerald' },
  // Cyans & Blues
  { value: '#14b8a6', name: 'Teal' },
  { value: '#06b6d4', name: 'Cyan' },
  { value: '#0ea5e9', name: 'Sky' },
  { value: '#3b82f6', name: 'Blue' },
  { value: '#6366f1', name: 'Indigo' },
  // Purples & Pinks
  { value: '#8b5cf6', name: 'Violet' },
  { value: '#a855f7', name: 'Purple' },
  { value: '#d946ef', name: 'Fuchsia' },
  { value: '#ec4899', name: 'Pink' },
  { value: '#f43f5e', name: 'Rose' },
  // Neutrals
  { value: '#64748b', name: 'Slate' },
  { value: '#6b7280', name: 'Gray' },
  { value: '#78716c', name: 'Stone' },
];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse color string to RGB and Alpha components
 */
function parseColor(color: string): { hex6: string; alpha: number } {
  const cleaned = color.replace('#', '');
  
  if (cleaned.length === 8) {
    // 8-digit hex: #RRGGBBAA
    return {
      hex6: '#' + cleaned.slice(0, 6),
      alpha: parseInt(cleaned.slice(6, 8), 16) / 255,
    };
  } else if (cleaned.length === 6) {
    // 6-digit hex: #RRGGBB (assume full opacity)
    return {
      hex6: '#' + cleaned,
      alpha: 1,
    };
  }
  
  // Fallback to white
  return { hex6: '#ffffff', alpha: 1 };
}

/**
 * Convert alpha (0-1) to 2-digit hex string
 */
function alphaToHex(alpha: number): string {
  return Math.round(alpha * 255).toString(16).padStart(2, '0');
}

/**
 * Combine 6-digit hex and alpha to 8-digit hex
 */
function toHex8(hex6: string, alpha: number): string {
  const cleaned = hex6.replace('#', '');
  return '#' + cleaned + alphaToHex(alpha);
}

/**
 * Validate hex color string
 */
function isValidHex(value: string): boolean {
  return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value);
}

// ============================================================================
// Component
// ============================================================================

export function ColorPicker({
  value,
  onChange,
  label,
  showHexInput = true,
  showOpacity = true,
  disabled = false,
  className,
  mode: initialMode = 'picker',
  allowModeSwitch,
  presetColors,
}: ColorPickerProps) {
  const { t } = useTranslation('common');
  const toast = useToast();
  
  // Determine presets to use
  const presets = presetColors ?? DEFAULT_PRESET_COLORS;
  
  // Determine if mode switching is allowed
  const canSwitchMode = allowModeSwitch ?? true;
  
  // Current mode
  const [mode, setMode] = useState<ColorPickerMode>(initialMode);
  
  // Parse initial value
  const { hex6: initialHex6, alpha: initialAlpha } = parseColor(value);
  
  // Internal state
  const [hex6, setHex6] = useState(initialHex6);
  const [alpha, setAlpha] = useState(initialAlpha);
  const [hexInput, setHexInput] = useState(value.toUpperCase());
  const [copied, setCopied] = useState(false);
  
  // Sync internal state when value prop changes
  useEffect(() => {
    const parsed = parseColor(value);
    // Defer state updates to avoid cascading render warning
    setTimeout(() => {
      setHex6(parsed.hex6);
      setAlpha(parsed.alpha);
      setHexInput(value.toUpperCase());
    }, 0);
  }, [value]);
  
  // Emit change
  const emitChange = useCallback((newHex6: string, newAlpha: number) => {
    const hex8 = toHex8(newHex6, newAlpha);
    onChange(hex8.toLowerCase());
  }, [onChange]);
  
  // Handle native color picker change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex6 = e.target.value;
    setHex6(newHex6);
    setHexInput(toHex8(newHex6, alpha).toUpperCase());
    emitChange(newHex6, alpha);
  };
  
  // Handle preset color selection
  const handlePresetSelect = (presetValue: string) => {
    if (disabled) return;
    const parsed = parseColor(presetValue);
    setHex6(parsed.hex6);
    setAlpha(parsed.alpha);
    setHexInput(toHex8(parsed.hex6, parsed.alpha).toUpperCase());
    emitChange(parsed.hex6, parsed.alpha);
  };
  
  // Handle opacity slider change
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAlpha = parseInt(e.target.value, 10) / 100;
    setAlpha(newAlpha);
    setHexInput(toHex8(hex6, newAlpha).toUpperCase());
    emitChange(hex6, newAlpha);
  };
  
  // Handle hex input change
  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.toUpperCase();
    
    // Auto-add # if missing
    if (inputValue && !inputValue.startsWith('#')) {
      inputValue = '#' + inputValue;
    }
    
    setHexInput(inputValue);
    
    // Validate and apply
    if (isValidHex(inputValue)) {
      const parsed = parseColor(inputValue);
      setHex6(parsed.hex6);
      setAlpha(parsed.alpha);
      emitChange(parsed.hex6, parsed.alpha);
    }
  };
  
  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hexInput);
      setCopied(true);
      toast.success(t('color_copied', { defaultValue: 'Copied!' }));
      setTimeout(() => { setCopied(false); }, 2000);
    } catch {
      toast.error(t('copy_failed', { defaultValue: 'Copy failed' }));
    }
  };
  
  // Toggle mode
  const toggleMode = () => {
    setMode(prev => prev === 'picker' ? 'presets' : 'picker');
  };
  
  // Calculate opacity percentage for display
  const opacityPercent = Math.round(alpha * 100);
  
  // Check if current color matches a preset
  const isPresetSelected = (presetValue: string) => {
    const presetParsed = parseColor(presetValue);
    return presetParsed.hex6.toLowerCase() === hex6.toLowerCase();
  };
  
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Label + Mode Toggle */}
      {(label || canSwitchMode) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-foreground">{label}</label>
          )}
          {canSwitchMode && (
            <button
              type="button"
              onClick={toggleMode}
              disabled={disabled}
              className={cn(
                'p-1.5 rounded-md text-muted hover:text-foreground hover:bg-muted/10',
                'transition-colors text-xs flex items-center gap-1',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              title={mode === 'picker' 
                ? t('switch_to_presets', { defaultValue: 'Switch to color palette' })
                : t('switch_to_picker', { defaultValue: 'Switch to color picker' })
              }
            >
              {mode === 'picker' ? (
                <>
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('presets', { defaultValue: 'Palette' })}</span>
                </>
              ) : (
                <>
                  <Pipette className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('picker', { defaultValue: 'Picker' })}</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      
      {/* Picker Mode: Color Swatch + Hex Input */}
      {mode === 'picker' && (
        <div className="flex items-center gap-3">
          {/* Color Swatch (Native Picker) */}
          <div className="relative">
            <input
              type="color"
              value={hex6}
              onChange={handleColorChange}
              disabled={disabled}
              className={cn(
                'w-12 h-12 rounded-lg cursor-pointer border-2 border-border',
                'bg-transparent p-0.5',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              style={{ 
                backgroundColor: toHex8(hex6, alpha),
              }}
            />
            {/* Checkerboard pattern for transparent preview */}
            <div 
              className="absolute inset-0.5 rounded-md -z-10"
              style={{
                backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                 linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                                 linear-gradient(45deg, transparent 75%, #ccc 75%), 
                                 linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              }}
            />
          </div>
          
          {/* Hex Input */}
          {showHexInput && (
            <div className="flex-1 relative">
              <input
                type="text"
                value={hexInput}
                onChange={handleHexInputChange}
                disabled={disabled}
                placeholder="#FFFFFFFF"
                maxLength={9}
                className={cn(
                  'w-full px-3 py-2.5 pr-10 rounded-lg font-mono text-sm uppercase',
                  'bg-surface border border-border',
                  'text-foreground placeholder:text-muted',
                  'transition-all duration-200',
                  'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              />
              <button
                type="button"
                onClick={() => { void handleCopy(); }}
                disabled={disabled}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md',
                  'text-muted hover:text-foreground hover:bg-muted/10',
                  'transition-colors',
                  disabled && 'pointer-events-none'
                )}
                title={t('copy', { defaultValue: 'Copy' })}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Presets Mode: Color Palette */}
      {mode === 'presets' && (
        <div className="space-y-2">
          {/* Color Grid */}
          <div className="grid grid-cols-10 gap-1.5 p-2 border border-border rounded-lg bg-surface/50">
            {presets.map((preset, index) => {
              const isSelected = isPresetSelected(preset.value);
              return (
                <button
                  key={`${preset.value}-${String(index)}`}
                  type="button"
                  onClick={() => { handlePresetSelect(preset.value); }}
                  disabled={disabled}
                  className={cn(
                    'w-7 h-7 rounded-md transition-all',
                    'border-2 hover:scale-110',
                    isSelected 
                      ? 'border-primary ring-2 ring-primary/30 scale-110' 
                      : 'border-transparent hover:border-muted',
                    disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
                  )}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name ?? preset.value}
                />
              );
            })}
          </div>
          
          {/* Selected Color Display */}
          {showHexInput && (
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-border"
                style={{ backgroundColor: toHex8(hex6, alpha) }}
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={hexInput}
                  onChange={handleHexInputChange}
                  disabled={disabled}
                  placeholder="#FFFFFFFF"
                  maxLength={9}
                  className={cn(
                    'w-full px-3 py-2 pr-10 rounded-lg font-mono text-sm uppercase',
                    'bg-surface border border-border',
                    'text-foreground placeholder:text-muted',
                    'transition-all duration-200',
                    'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                />
                <button
                  type="button"
                  onClick={() => { void handleCopy(); }}
                  disabled={disabled}
                  className={cn(
                    'absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md',
                    'text-muted hover:text-foreground hover:bg-muted/10',
                    'transition-colors',
                    disabled && 'pointer-events-none'
                  )}
                  title={t('copy', { defaultValue: 'Copy' })}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Opacity Slider */}
      {showOpacity && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted min-w-[60px]">
            {t('opacity', { defaultValue: 'Opacity' })}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={opacityPercent}
            onChange={handleOpacityChange}
            disabled={disabled}
            className={cn(
              'flex-1 h-2 rounded-full appearance-none cursor-pointer',
              'bg-gradient-to-r from-transparent to-current',
              '[&::-webkit-slider-thumb]:appearance-none',
              '[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
              '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white',
              '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary',
              '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer',
              '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
              '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white',
              '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary',
              '[&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{
              background: `linear-gradient(to right, 
                transparent 0%, 
                ${hex6} 100%), 
                repeating-linear-gradient(45deg, 
                  #ccc, #ccc 2px, 
                  #fff 2px, #fff 4px)`,
            }}
          />
          <span className="text-sm font-medium text-foreground min-w-[40px] text-right">
            {opacityPercent}%
          </span>
        </div>
      )}
    </div>
  );
}
