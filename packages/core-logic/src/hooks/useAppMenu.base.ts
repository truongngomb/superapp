import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { markdownService } from '../services/markdown.service';
import { IMenuItem, MarkdownMenuItem } from '@superapp/shared-types';

export interface UseAppMenuOptions {
  staticItems: IMenuItem[];
  language: string;
  resolveIcon: (iconName?: string | null) => unknown;
}

/**
 * Base hook for application menu management.
 * Handles fetching dynamic markdown menu and merging it with static items.
 */
export function useAppMenuBase({ staticItems, language, resolveIcon }: UseAppMenuOptions) {
  const { data: dynamicItems = [], isLoading } = useQuery({
    queryKey: ['menu-tree', language],
    queryFn: () => markdownService.getMenuTree(language),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });

  const menuItems = useMemo(() => {
    const mapMarkdownToMenu = (item: MarkdownMenuItem): IMenuItem => {
      return {
        path: `/pages/${item.slug}`,
        label: item.menuTitle || item.title,
        isTitle: item.isTitle,
        icon: resolveIcon(item.icon),
        children: item.children?.map(mapMarkdownToMenu),
        matchPrefix: true // Default for markdown pages
      };
    };

    const mappedDynamicItems = dynamicItems.map(mapMarkdownToMenu);

    const homeItem = staticItems.find(i => i.path === '/');
    const otherItems = staticItems.filter(i => i.path !== '/');
    
    const merged: IMenuItem[] = [];
    if (homeItem) merged.push(homeItem);
    merged.push(...mappedDynamicItems);
    merged.push(...otherItems);

    return merged;
  }, [staticItems, dynamicItems, resolveIcon]);

  return { menuItems, loading: isLoading && dynamicItems.length === 0 };
}
