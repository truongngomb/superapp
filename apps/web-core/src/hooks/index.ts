/**
 * Hooks Module Exports
 */

// Local hooks
export { usePermission, usePermissions } from './usePermission';
export * from './useCategories';
export * from './useUsers';
export * from './useActivityLogs';
export * from './useSettings';
export * from './useMarkdownPages';
export * from './useAppMenu';
export { useMediaUpload } from './useMedia';
export * from './useSystemHealth';

export * from './useLayoutMode';
export * from './useLayout';
export * from './useResourceService';
export * from './useMediaQuery';
export * from './useResponsiveView';
export * from './useInfiniteResource';
export * from './usePageTitle';
export { useAutoVersionCheck } from './useAutoVersionCheck';

// Re-exports from core-logic package
export {
  useAuth,
  useTheme,
  useResource,
  usePreferenceSync,
  useDebounce,
  useDebounceCallback,
  useSort,
  useDataSorting,
  useExcelExport,
  useOnClickOutside,
} from '@superapp/core-logic';
export type { UseResourceReturn } from '@superapp/core-logic';

// Context hooks re-exports
export { useToast } from '@/context/useToast';
