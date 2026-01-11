/**
 * Main Layout Component
 * Root layout that manages layout selection (Standard vs Modern)
 */

import { useState } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/common';
import { getStorageItem, setStorageItem } from '@/utils';
import { STORAGE_KEYS } from '@/config';
import { StandardLayout } from './StandardLayout';
import { ModernLayout } from './ModernLayout';

type LayoutMode = 'standard' | 'modern';

export function MainLayout() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    return getStorageItem<LayoutMode>(STORAGE_KEYS.LAYOUT_MODE) || 'standard';
  });

  const toggleLayout = () => {
    const newMode = layoutMode === 'standard' ? 'modern' : 'standard';
    setLayoutMode(newMode);
    setStorageItem(STORAGE_KEYS.LAYOUT_MODE, newMode);
  };

  return (
    <>
      {layoutMode === 'modern' ? <ModernLayout /> : <StandardLayout />}
      
      {/* Layout Switcher Floating Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={toggleLayout}
          size="sm"
          className="rounded-full shadow-lg opacity-80 hover:opacity-100 transition-opacity"
          title={`Switch to ${layoutMode === 'standard' ? 'Modern' : 'Standard'} Layout`}
        >
          <LayoutTemplate className="w-4 h-4 mr-2" />
          {layoutMode === 'standard' ? 'New Layout' : 'Old Layout'}
        </Button>
      </div>
    </>
  );
}
