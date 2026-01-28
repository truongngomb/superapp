import { SharedLayoutAdapter as BaseSharedLayoutAdapter } from '@superapp/ui-kit';
import { useAppMenu } from '@/hooks';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@superapp/core-logic';
import { NAVIGATION_ITEMS } from '@/config/navigation';
import { useMemo } from 'react';

export function SharedLayoutAdapter() {
  const { menuItems } = useAppMenu();
  const { pathname } = useLocation();
  const { t } = useTranslation(['video_projects', 'uikit']);

  const title = useMemo(() => {
    // Sort items by path length descending to match specific paths before prefixes
    const sortedItems = [...NAVIGATION_ITEMS].sort((a, b) => b.path.length - a.path.length);
    
    const item = sortedItems.find(item => {
      if (item.matchPrefix) {
           return pathname.startsWith(item.path);
       }
       return pathname === item.path;
    });
    
    if (item) {
        return `${t(item.labelKey)} | Story Weaver`;
    }
    return null;
  }, [pathname, t]);

  useDocumentTitle(title);

  return (
    <BaseSharedLayoutAdapter 
      menuItems={menuItems}
    />
  );
}
