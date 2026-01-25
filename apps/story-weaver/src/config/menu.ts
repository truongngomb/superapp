import { LayoutDashboard, Video, Library, Settings } from 'lucide-react';
import { IMenuItem } from '@superapp/shared-types';

export const STORY_WEAVER_MENU: IMenuItem[] = [
  {
    path: '/story-weaver',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/story-weaver/create',
    label: 'Create Video',
    icon: Video,
  },
  {
    path: '/story-weaver/library',
    label: 'Library',
    icon: Library,
  },
  {
    path: '/story-weaver/settings',
    label: 'Settings',
    icon: Settings,
  }
];
