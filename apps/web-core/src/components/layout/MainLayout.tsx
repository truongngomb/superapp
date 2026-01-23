import { useLayoutMode, usePageTitle, useAutoVersionCheck } from '@/hooks';
import { StandardLayout } from './StandardLayout';
import { ModernLayout } from './ModernLayout';

export function MainLayout() {
  usePageTitle();
  useAutoVersionCheck();
  const layoutMode = useLayoutMode();

  const content = layoutMode === 'modern' ? <ModernLayout /> : <StandardLayout />;

  return (
    <>
      {content}
    </>
  );
}
