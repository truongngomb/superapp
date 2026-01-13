import { useMemo } from 'react';

import type { SortConfig } from './useSort';

/**
 * Hook to sort an array of objects based on SortConfig
 * @param data Array of objects to sort
 * @param sortConfig Current sort configuration (field, order)
 * @returns Sorted array
 */
export function useDataSorting<T>(data: T[], sortConfig: SortConfig) {
  return useMemo(() => {
    if (!sortConfig.field || !sortConfig.order) return data;

    return [...data].sort((a, b) => {
      const field = sortConfig.field as keyof T;
      const aValue = a[field];
      const bValue = b[field];

      // Handle different types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      // Handle boolean types (false < true)
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        const aNum = aValue ? 1 : 0;
        const bNum = bValue ? 1 : 0;
        return sortConfig.order === 'asc' ? aNum - bNum : bNum - aNum;
      }
      // Skip objects/arrays
      if (typeof aValue === 'object' || typeof bValue === 'object') {
        return 0;
      }
      
      // Handle null/undefined or numbers converted to string for comparison
      const aStr = aValue != null ? String(aValue) : '';
      const bStr = bValue != null ? String(bValue) : '';
      
      return sortConfig.order === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortConfig]);
}
