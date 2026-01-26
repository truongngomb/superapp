import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppMenuBase } from '@superapp/core-logic';
import { resolveIcon } from '../utils/icon-resolver';
import { IMenuItem } from '@superapp/shared-types';
import { LucideIcon } from 'lucide-react';

export interface StaticNavigationItem {
  path: string;
  labelKey: string;
  icon: LucideIcon;
  permission?: {
    resource: string;
    action: string;
  };
  matchPrefix?: boolean;
}

/**
 * Shared hook for application menu management.
 * Combines static configuration items with dynamic markdown menu items.
 * 
 * @param staticNavigationItems - App-specific navigation configuration
 */
export function useAppMenu(staticNavigationItems: StaticNavigationItem[]) {
  const { i18n, t } = useTranslation(['uikit', 'home', 'categories', 'markdown']);

  const staticItems = useMemo((): IMenuItem[] => 
    staticNavigationItems.map(item => ({
      path: item.path,
      label: t(item.labelKey),
      icon: item.icon,
      permission: item.permission,
      matchPrefix: item.matchPrefix,
    }))
  , [t, staticNavigationItems]);

  return useAppMenuBase({
    staticItems,
    language: i18n.language,
    resolveIcon: (name) => resolveIcon(name)
  });
}
