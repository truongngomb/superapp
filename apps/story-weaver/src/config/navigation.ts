import { Home, Settings, Video } from 'lucide-react';
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
    path: '/dashboard', 
    labelKey: 'video_projects:navigation.dashboard', 
    icon: Home 
  },
  { 
    path: '/library', 
    labelKey: 'video_projects:navigation.library', 
    icon: Video 
  },
  { 
    path: '/settings', 
    labelKey: 'uikit:settings', 
    icon: Settings
  }
] as const;
