import { LayoutDashboard, Video, Library, Settings } from 'lucide-react';
import { IMenuItem } from '@superapp/shared-types';

export const STORY_WEAVER_MENU: IMenuItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/create',
    label: 'Create Video',
    icon: Video,
  },
  {
    path: '/library',
    label: 'Library',
    icon: Library,
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: Settings,
  }
];
