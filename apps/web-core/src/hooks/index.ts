/**
 * Hooks Module Exports
 */

// Local hooks
export * from './useCategories';
export * from './useUsers';
export * from './useActivityLogs';
export * from './useMarkdownPages';
export * from './useAppMenu';
export { useMediaUpload } from './useMedia';
export * from './useSystemHealth';
export * from './useResourceService';
export * from './usePageTitle';
export { useAutoVersionCheck } from './useAutoVersionCheck';

// Re-exports from core-logic package
export {
  useAuth,
  useTheme,
  useResource,
  usePermission,
  usePermissions,
  useInfiniteResource,
  useSettings,
  usePreferenceSync,
  useDebounce,
  useDebounceCallback,
  useSort,
  useDataSorting,
  useExcelExport,
  useOnClickOutside,
  useLayoutMode,
  useLayout,
  LayoutProvider,
  useActivityLogContext,
  useMediaQuery,
  useResponsiveView,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
} from '@superapp/core-logic';
export type { UseResourceReturn } from '@superapp/core-logic';
