import { useLayoutMode } from '@/hooks';
import { StandardLayout } from './StandardLayout';
import { ModernLayout } from './ModernLayout';

export function MainLayout() {
  const layoutMode = useLayoutMode();

  const content = layoutMode === 'modern' ? <ModernLayout /> : <StandardLayout />;

  return (
    <>
      {content}
    </>
  );
}
