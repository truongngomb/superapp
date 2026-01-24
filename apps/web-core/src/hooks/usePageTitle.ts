import { useEffect } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Map paths to translation keys
// Keys format: "namespace:key"
const routeTitles: Record<string, string> = {
  '/': 'home:hero.badge', // Using hero badge "SuperApp" or similar as title, or strictly home:title if exists
  '/categories': 'categories:title',
  '/login': 'auth:login.title',
  
  // Admin Routes
  '/admin/dashboard': 'common:dashboard',
  '/admin/users': 'users:title',
  '/admin/roles': 'roles:title',
  '/admin/activity-logs': 'activity_logs:title',
  '/admin/settings': 'settings:title',
  '/markdown-pages': 'markdown:title',
  '/admin/api-docs': 'common:resources.api_docs',
};

export function usePageTitle() {
  const location = useLocation();
  const { t } = useTranslation([
    'common', 
    'home', 
    'categories', 
    'auth', 
    'users', 
    'roles', 
    'activity_logs', 
    'settings', 
    'markdown'
  ]);

  useEffect(() => {
    const path = location.pathname;
    let titleKey = '';

    // 1. Exact match
    if (routeTitles[path]) {
      titleKey = routeTitles[path];
    } 
    // 2. Pattern match (if we had patterns like /users/:id)
    // For now, most routes are static or handled by leaf components (Markdown Viewer)
    else {
      // Check for Admin nested routes
      const adminMatch = Object.keys(routeTitles).find(route => {
        return route !== '/' && matchPath({ path: route, end: true }, path);
      });

      if (adminMatch) {
        titleKey = routeTitles[adminMatch] || '';
      }
    }

    // 3. Fallback for known prefixes if exact match fails
    if (!titleKey) {
       if (path.startsWith('/admin/users')) titleKey = 'users:title';
       else if (path.startsWith('/admin/roles')) titleKey = 'roles:title';
    }

    if (titleKey) {
      const title = t(titleKey);
      document.title = `${title} | SuperApp`;
    } 
    // If no match (e.g. /pages/:slug), we do nothing here and let the specific page handle it
    
  }, [location, t]);
}
