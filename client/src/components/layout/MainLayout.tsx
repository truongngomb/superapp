import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { StandardLayout } from './StandardLayout';
import { ModernLayout } from './ModernLayout';
import { useSettings } from '@/hooks';

type LayoutMode = 'standard' | 'modern';

export function MainLayout() {
  const { settings, getSettingValue } = useSettings();
  const location = useLocation();

  const layoutMode = useMemo(() => {
    // 1. Check if settings are loaded
    if (settings.length === 0) return 'standard';

    const layoutConfig = getSettingValue('layout_config', {
      global: 'standard',
      pages: {} as Record<string, string>
    });

    // 2. Check page specific
    const path = location.pathname;
    
    // Find best match (longest prefix)
    const pageOverrides = layoutConfig.pages;
    const sortedPaths = Object.keys(pageOverrides).sort((a, b) => b.length - a.length);
    
    for (const p of sortedPaths) {
      if (path === p || path.startsWith(`${p}/`)) {
        return pageOverrides[p] as LayoutMode;
      }
    }

    // 3. Global default
    return layoutConfig.global as LayoutMode;
  }, [settings, getSettingValue, location.pathname]);

  return layoutMode === 'modern' ? <ModernLayout /> : <StandardLayout />;
}
