import { SharedLayoutAdapter as BaseSharedLayoutAdapter } from '@superapp/ui-kit';
import { useAppMenu } from '@/hooks';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDocumentTitle } from '@superapp/core-logic';
import { APP_NAME } from '@/config/constants';
import { NAVIGATION_ITEMS } from '@/config/navigation';
import { useMemo } from 'react';
import { Clapperboard } from 'lucide-react';

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
        return `${t(item.labelKey)} | ${APP_NAME}`;
    }
    return null;
  }, [pathname, t]);

  useDocumentTitle(title);

  return (
    <BaseSharedLayoutAdapter 
      menuItems={menuItems}
      appName={APP_NAME}
      appLogo={
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
             <Clapperboard className="w-5 h-5 text-white" />
          </div>
      }
    />
  );
}
