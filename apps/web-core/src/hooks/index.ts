/**
 * Hooks Module Exports
 */

// Local hooks
export { useAuth } from './useAuth';
export { usePermission, usePermissions } from './usePermission';
export * from './useCategories';
export * from './useUsers';
export * from './useActivityLogs';
export * from './useSettings';
export * from './useMarkdownPages';

export * from './useLayoutMode';
export * from './useLayout';
export * from './useResource';
export type { UseResourceReturn } from './useResource';
export * from './useResourceService';
export * from './usePreferenceSync';
export * from './useMediaQuery';
export * from './useResponsiveView';
export * from './useInfiniteResource';

// Re-exports from core-logic package
export {
  useDebounce,
  useDebounceCallback,
  useSort,
  useDataSorting,
  useExcelExport,
  useOnClickOutside,
} from '@superapp/core-logic';

// Context hooks re-exports
export { useToast } from '@/context/useToast';
export { useTheme } from '@/context/useTheme';
