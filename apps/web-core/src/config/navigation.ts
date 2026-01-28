import { Home, Folder, Settings, FileText } from 'lucide-react';
import type { StaticNavigationItem } from '@superapp/ui-kit';

export const NAVIGATION_ITEMS: StaticNavigationItem[] = [
  { 
    path: '/', 
    labelKey: 'home:title', 
    icon: Home 
  },
  { 
    path: '/categories', 
    labelKey: 'categories:title', 
    icon: Folder,
    permission: { resource: 'categories', action: 'view' }
  },
  { 
    path: '/markdown-pages', 
    labelKey: 'markdown:title', 
    icon: FileText,
    permission: { resource: 'markdown_pages', action: 'view' }
  },
  { 
    path: '/admin', 
    labelKey: 'admin', 
    icon: Settings,
    permission: { resource: 'dashboard', action: 'view' },
    matchPrefix: true
  }
] as const;
