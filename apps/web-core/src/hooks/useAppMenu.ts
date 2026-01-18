import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMarkdownPages } from './useMarkdownPages';
import { NAVIGATION_ITEMS } from '@/config/navigation';
import { MarkdownMenuItem } from '@superapp/shared-types';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export type AppMenuItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  permission?: {
    resource: string;
    action: string;
  };
  isTitle?: boolean;
  children?: AppMenuItem[];
  matchPrefix?: boolean;
};

export function useAppMenu() {
  const { t } = useTranslation(['common', 'categories', 'markdown']);
  const { getMenuTree } = useMarkdownPages();
  const [menuItems, setMenuItems] = useState<AppMenuItem[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    let mounted = true;

    // Helper to convert MarkdownMenuItem to AppMenuItem
    const mapMarkdownToMenu = (item: MarkdownMenuItem): AppMenuItem => {
      // Dynamically resolve icon or default to FileText
      // We assume item.icon is the string name of a Lucide icon
      let IconComponent = LucideIcons.FileText;
      if (item.icon && item.icon in LucideIcons) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        IconComponent = (LucideIcons as any)[item.icon] as LucideIcon;
      }

      return {
        path: `/pages/${item.slug}`,
        label: item.menuTitle || item.title,
        isTitle: item.isTitle,
        icon: IconComponent,
        children: item.children?.map(mapMarkdownToMenu),
      };
    };

    const fetchMenu = async () => {
      try {
        const dynamicMenuData = await getMenuTree();
        
        if (!mounted) return;

        // Map static items
        const staticItems: AppMenuItem[] = NAVIGATION_ITEMS.map(item => ({
          path: item.path,
          label: t(item.labelKey),
          icon: item.icon,
          permission: item.permission,
          matchPrefix: item.matchPrefix,
        }));

        // Map dynamic items
        const dynamicItems = dynamicMenuData.map(mapMarkdownToMenu);

        // Merge: Insert dynamic items at index 1 (after Home).
        const homeItem = staticItems.find(i => i.path === '/');
        const otherItems = staticItems.filter(i => i.path !== '/');
        
        const merged: AppMenuItem[] = [];
        if (homeItem) merged.push(homeItem);
        merged.push(...dynamicItems);
        merged.push(...otherItems);

        setMenuItems(merged);
      } catch (error) {
        console.error('Failed to fetch menu tree:', error);
        // Fallback to static only
        const staticItems: AppMenuItem[] = NAVIGATION_ITEMS.map(item => ({
          path: item.path,
          label: t(item.labelKey),
          icon: item.icon,
          permission: item.permission,
          matchPrefix: item.matchPrefix,
        }));
        setMenuItems(staticItems);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchMenu();

    return () => {
      mounted = false;
    };
  }, [t, getMenuTree]);

  return { menuItems, loading };
}
