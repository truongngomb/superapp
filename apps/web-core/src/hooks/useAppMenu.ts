import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { markdownService } from '@/services';
import { NAVIGATION_ITEMS } from '@/config/navigation';
import { MarkdownMenuItem } from '@superapp/shared-types';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { CATEGORY_ICONS } from '@superapp/ui-kit';

export type AppMenuItem = {
  path: string;
  label: string;
  icon?: LucideIcon;
  permission?: {
    resource: string;
    action: string;
  };
  isTitle?: boolean;
  children?: AppMenuItem[];
  matchPrefix?: boolean;
};

export function useAppMenu() {
  const { t, i18n } = useTranslation(['common', 'categories', 'markdown']);

  // Fetch menu tree with caching
  const { data: dynamicItems = [], isLoading } = useQuery({
    queryKey: ['menu-tree', i18n.language],
    queryFn: () => markdownService.getMenuTree(i18n.language),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    placeholderData: (previousData) => previousData, // Use cached data while re-fetching
  });

  const menuItems = useMemo(() => {
    // Helper to convert MarkdownMenuItem to AppMenuItem
    const mapMarkdownToMenu = (item: MarkdownMenuItem): AppMenuItem => {
      // Dynamically resolve icon or default to FileText
      let IconComponent: LucideIcon | undefined = undefined;
      
      if (item.icon) {
         // 1. Try CATEGORY_ICONS (prioritize picker keys)
         if (CATEGORY_ICONS[item.icon]) {
            IconComponent = CATEGORY_ICONS[item.icon] as LucideIcon;
         } 
         // 2. Try direct Lucide lookup (case-sensitive)
         else if (item.icon in LucideIcons) {
            const icons = LucideIcons as unknown as Record<string, unknown>;
            IconComponent = icons[item.icon] as LucideIcon;
         }
         // 3. Try PascalCase fallback (e.g. "shopping_bag" -> "ShoppingBag")
         else {
            const pascalName = item.icon
               .split('_')
               .map(w => w.charAt(0).toUpperCase() + w.slice(1))
               .join('');
            
            if (pascalName in LucideIcons) {
               const icons = LucideIcons as unknown as Record<string, unknown>;
               IconComponent = icons[pascalName] as LucideIcon;
            }
         }
      }

      // Backend already resolved locale, use values directly
      const label = item.menuTitle || item.title;
      const slug = item.slug;

      return {
        path: `/pages/${slug}`,
        label: label,
        isTitle: item.isTitle,
        icon: IconComponent,
        children: item.children?.map(mapMarkdownToMenu),
      };
    };

    // Map static items
    const staticItems: AppMenuItem[] = NAVIGATION_ITEMS.map(item => ({
      path: item.path,
      label: t(item.labelKey),
      icon: item.icon,
      permission: item.permission,
      matchPrefix: item.matchPrefix,
    }));

    // Map dynamic items
    const mappedDynamicItems = dynamicItems.map(mapMarkdownToMenu);

    // Merge: Insert dynamic items at index 1 (after Home).
    const homeItem = staticItems.find(i => i.path === '/');
    const otherItems = staticItems.filter(i => i.path !== '/');
    
    const merged: AppMenuItem[] = [];
    if (homeItem) merged.push(homeItem);
    merged.push(...mappedDynamicItems);
    merged.push(...otherItems);

    return merged;
  }, [t, dynamicItems]);

  return { menuItems, loading: isLoading && dynamicItems.length === 0 };
}
