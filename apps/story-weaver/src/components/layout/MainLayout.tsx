import { Outlet, useLocation } from 'react-router-dom';
import { AppLayout } from '@superapp/ui-kit';
import { STORY_WEAVER_MENU } from '../../config/menu';

export function MainLayout() {
  const location = useLocation();

  // Mock Data for Migration Phase
  const mockUser = {
    name: 'Story Teller',
    avatar: '',
    email: 'creator@storyweaver.io',
    role: 'Creator'
  };

  return (
    <AppLayout
       layoutMode="modern" 
       items={STORY_WEAVER_MENU}
       currentPath={location.pathname}
       user={mockUser}
       isAuthenticated={true}
       isDark={false}
       footerText={<>Story Weaver<br/>AI Video Generator</>}
       onLogout={() => console.log('Logout clicked')}
       onToggleTheme={() => console.log('Theme toggle clicked')}
    >
      <Outlet />
    </AppLayout>
  );
}
