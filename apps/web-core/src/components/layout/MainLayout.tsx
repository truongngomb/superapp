import { useLayoutMode } from '@/hooks';
import { LayoutProvider } from '@/context/LayoutProvider';
import { StandardLayout } from './StandardLayout';
import { ModernLayout } from './ModernLayout';

export function MainLayout() {
  const layoutMode = useLayoutMode();

  const content = layoutMode === 'modern' ? <ModernLayout /> : <StandardLayout />;

  return (
    <LayoutProvider>
      {content}
    </LayoutProvider>
  );
}
