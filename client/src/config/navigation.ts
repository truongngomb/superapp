import { Home, Folder, Settings } from 'lucide-react';
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
    labelKey: 'categories', 
    icon: Folder 
  },
  { 
    path: '/admin/dashboard', 
    labelKey: 'admin', 
    icon: Settings,
    permission: { resource: 'users', action: 'read' },
    matchPrefix: true
  }
] as const;
