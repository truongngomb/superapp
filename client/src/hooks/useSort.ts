import { useState } from 'react';
import { getStorageItem, setStorageItem } from '@/utils';
import type { SortOrder, SortConfig } from '@/types';

// Re-export for backward compatibility
export type { SortOrder, SortConfig };

export interface UseSortOptions {
  storageKey?: string;
}

/**
 * Hook for managing sort state
 * @param defaultField - Default sort field
 * @param defaultOrder - Default sort order
 * @param options - Optional configuration including storageKey for persistence
 */
export function useSort(
  defaultField: string = 'created',
  defaultOrder: SortOrder = 'desc',
  options?: UseSortOptions
) {
  const { storageKey } = options || {};

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    if (storageKey) {
      const saved = getStorageItem<SortConfig>(storageKey);
      if (saved && saved.field && saved.order) {
        return saved;
      }
    }
    return { field: defaultField, order: defaultOrder };
  });

  const handleSort = (field: string) => {
    setSortConfig((prev) => {
      let newConfig: SortConfig;
      if (prev.field !== field) {
        // New field - start with descending
        newConfig = { field, order: 'desc' };
      } else if (prev.order === 'desc') {
        // Same field - cycle: desc -> asc -> reset to default
        newConfig = { field, order: 'asc' };
      } else if (prev.order === 'asc') {
        newConfig = { field: defaultField, order: defaultOrder };
      } else {
        newConfig = { field, order: 'desc' };
      }

      if (storageKey) {
        setStorageItem(storageKey, newConfig as unknown as Record<string, unknown>);
      }
      return newConfig;
    });
  };

  return { sortConfig, handleSort };
}
