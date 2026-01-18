import { Home, Folder, Settings, FileText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { ParseKeys } from 'i18next';

export interface NavigationItem {
  path: string;
  labelKey: ParseKeys;
  icon: LucideIcon;
  permission?: {
    resource: string;
    action: string;
  };
  matchPrefix?: boolean;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { 
    path: '/', 
    labelKey: 'home', 
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
    permission: { resource: 'markdown_manage', action: 'view' }
  },
  { 
    path: '/admin', 
    labelKey: 'admin', 
    icon: Settings,
    permission: { resource: 'dashboard', action: 'view' },
    matchPrefix: true
  }
] as const;
