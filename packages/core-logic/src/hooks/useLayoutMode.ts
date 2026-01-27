import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { 
  type LayoutMode, 
  type LayoutConfig,
} from '@superapp/shared-types';
import { matchLayoutPath } from '../utils/pathMatcher';

export function useLayoutMode() {
  const { getSettingValue } = useSettings();
  const location = useLocation();

  return useMemo(() => {
    // 1. Try to get layout config from settings (or localStorage cache)
    const config = getSettingValue('layout_config', {
      global: 'standard',
      paths: []
    }) as LayoutConfig | undefined | null;

    // Handle null/undefined case
    if (!config) {
      return 'standard' as LayoutMode;
    }

    // Use window.location.pathname for full path (including basename)
    // This is needed because story-weaver uses basename="/story-weaver"
    // and location.pathname from react-router only gives the path after basename
    const fullPath = typeof window !== 'undefined' ? window.location.pathname : location.pathname;
    const routerPath = location.pathname;
    
    // Create variations of the path to check
    const pathsToCheck = [fullPath];
    
    // Also check router path (without basename) as fallback
    if (fullPath !== routerPath) {
      pathsToCheck.push(routerPath);
    }
    
    if (fullPath.startsWith('/admin/')) {
      pathsToCheck.push(fullPath.replace('/admin', ''));
    }
    
    if (fullPath.startsWith('/pages/')) {
      pathsToCheck.push('/markdown_view_pages');
    }

    // Find best match using the new path matching utility
    for (const currentPath of pathsToCheck) {
      const matchedMode = matchLayoutPath(currentPath, config.paths, config.global);
      // If we got a non-global match, return it
      if (matchedMode !== config.global) {
        return matchedMode;
      }
    }

    // Global default
    return config.global;
  }, [getSettingValue, location.pathname]);
}

