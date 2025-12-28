/**
 * Storage Utility
 * Type-safe localStorage wrapper with JSON serialization
 */

import { STORAGE_KEYS } from '@/config';

// ============================================================================
// Types
// ============================================================================

type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS] | string;

interface StorageOptions {
  /** Storage type (default: localStorage) */
  storage?: Storage;
  /** Expiration time in milliseconds */
  expiresIn?: number;
}

interface StoredItem<T> {
  value: T;
  expires?: number;
}

// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Get item from storage with type safety
 */
export function getStorageItem<T>(key: StorageKey, options?: StorageOptions): T | null {
  const storage = options?.storage ?? localStorage;
  
  try {
    const item = storage.getItem(key);
    if (!item) return null;

    const parsed: StoredItem<T> = JSON.parse(item);
    
    // Check expiration
    if (parsed.expires && Date.now() > parsed.expires) {
      storage.removeItem(key);
      return null;
    }

    return parsed.value;
  } catch {
    return null;
  }
}

/**
 * Set item in storage with optional expiration
 */
export function setStorageItem<T>(
  key: StorageKey,
  value: T,
  options?: StorageOptions
): void {
  const storage = options?.storage ?? localStorage;
  
  try {
    const item: StoredItem<T> = {
      value,
      ...(options?.expiresIn && { expires: Date.now() + options.expiresIn }),
    };
    
    storage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

/**
 * Remove item from storage
 */
export function removeStorageItem(key: StorageKey, options?: StorageOptions): void {
  const storage = options?.storage ?? localStorage;
  storage.removeItem(key);
}

/**
 * Clear all items from storage
 */
export function clearStorage(options?: StorageOptions): void {
  const storage = options?.storage ?? localStorage;
  storage.clear();
}

// ============================================================================
// Convenience Functions for Common Keys
// ============================================================================

/**
 * Get theme preference
 */
export function getTheme(): 'light' | 'dark' | null {
  return getStorageItem<'light' | 'dark'>(STORAGE_KEYS.THEME);
}

/**
 * Set theme preference
 */
export function setTheme(theme: 'light' | 'dark'): void {
  setStorageItem(STORAGE_KEYS.THEME, theme);
}
