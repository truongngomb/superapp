import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getStorageItem } from '@/utils';
import { STORAGE_KEYS } from '@/config';
import { StandardLayout } from './StandardLayout';
import { ModernLayout } from './ModernLayout';
import { useSettings } from '@/hooks';

type LayoutMode = 'standard' | 'modern';

export function MainLayout() {
  const { settings, getSettingValue } = useSettings();
  const location = useLocation();

  const layoutMode = useMemo(() => {
    // 1. Check localStorage for manual override (legacy/dev)
    const storedMode = getStorageItem<LayoutMode>(STORAGE_KEYS.LAYOUT_MODE);
    if (storedMode) return storedMode;

    if (settings.length === 0) return 'standard';

    const layoutConfig = getSettingValue('layout_config', {
      global: 'standard',
      pages: {} as Record<string, string>
    });

    // 2. Check page specific
    const path = location.pathname;
    if (path === '/' && layoutConfig.pages.home) return layoutConfig.pages.home as LayoutMode;
    if (path.startsWith('/categories') && layoutConfig.pages.categories) return layoutConfig.pages.categories as LayoutMode;

    // 3. Global default
    return layoutConfig.global as LayoutMode;
  }, [settings, getSettingValue, location.pathname]);

  return layoutMode === 'modern' ? <ModernLayout /> : <StandardLayout />;
}
