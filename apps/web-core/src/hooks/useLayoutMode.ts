import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from './useSettings';

export type LayoutMode = 'standard' | 'modern';

export function useLayoutMode() {
  const { settings, getSettingValue } = useSettings();
  const location = useLocation();

  return useMemo(() => {
    // 1. Check if settings are loaded
    if (settings.length === 0) return 'standard';

    const layoutConfig = getSettingValue('layout_config', {
      global: 'standard',
      pages: {} as Record<string, string>
    });

    // 2. Check page specific
    const path = location.pathname;
    
    // Create variations of the path to check (e.g., /admin/users -> check "/admin/users" AND "/users")
    const pathsToCheck = [path];
    if (path.startsWith('/admin/')) {
      pathsToCheck.push(path.replace('/admin', ''));
    }

    // Find best match (longest prefix)
    const pageOverrides = layoutConfig.pages;
    const sortedConfigPaths = Object.keys(pageOverrides).sort((a, b) => b.length - a.length);
    
    // Check real path first, then stripped path
    for (const currentPath of pathsToCheck) {
      for (const configPath of sortedConfigPaths) {
         // Check exact match or prefix match
         if (currentPath === configPath || currentPath.startsWith(`${configPath}/`)) {
           return pageOverrides[configPath] as LayoutMode;
         }
      }
    }

    // 3. Global default
    return layoutConfig.global as LayoutMode;
  }, [settings, getSettingValue, location.pathname]);
}
