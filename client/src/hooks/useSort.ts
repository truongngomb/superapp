import { useState } from 'react';

export type SortOrder = 'asc' | 'desc' | null;

export interface SortConfig {
  field: string;
  order: SortOrder;
}

/**
 * Hook for managing sort state
 */
export function useSort(defaultField: string = 'created', defaultOrder: SortOrder = 'desc') {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: defaultField,
    order: defaultOrder,
  });

  const handleSort = (field: string) => {
    setSortConfig((prev) => {
      if (prev.field !== field) {
        // New field - start with descending
        return { field, order: 'desc' };
      }
      // Same field - cycle: desc -> asc -> reset to default
      if (prev.order === 'desc') return { field, order: 'asc' };
      if (prev.order === 'asc') return { field: defaultField, order: defaultOrder };
      return { field, order: 'desc' };
    });
  };

  return { sortConfig, handleSort };
}
