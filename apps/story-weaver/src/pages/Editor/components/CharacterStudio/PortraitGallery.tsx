/**
 * PortraitGallery Component
 * 
 * Displays 4 portrait options for selection with master portrait indicator.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MediaLightbox, Button, LoadingSpinner } from '@superapp/ui-kit';
import { Check, RefreshCw, Upload, Maximize2 } from 'lucide-react';
import type { PortraitOption } from '@/types';

interface PortraitGalleryProps {
  portraits: PortraitOption[];
  masterPortraitUrl?: string;
  onSelectMaster: (portraitUrl: string) => void;
  onRegenerate?: () => void;
  isGenerating?: boolean;
  isSelectingMaster?: boolean;
  isLoading?: boolean;
}

export const PortraitGallery = ({
  portraits,
  masterPortraitUrl,
  onSelectMaster,
  onRegenerate,
  isGenerating,
  isSelectingMaster,
  isLoading = false,
}: PortraitGalleryProps) => {
  const { t } = useTranslation(['characters']);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(masterPortraitUrl || null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
    onSelectMaster(url);
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-muted-foreground">
          {t('characters:portrait.generating')}
        </p>
      </div>
    );
  }

  // Skeleton Loading State
  if (isLoading) {
     return (
       <div className="space-y-4">
         <div className="h-6 w-32 bg-muted-foreground/10 rounded animate-pulse" />
         <div className="h-4 w-48 bg-muted-foreground/10 rounded animate-pulse" />
         
         <div className="grid grid-cols-2 gap-3">
           {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="aspect-square bg-muted-foreground/10 rounded-lg animate-pulse border-2 border-transparent" />
           ))}
         </div>
       </div>
     );
  }

  if (portraits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('characters:portrait.no_portraits')}</p>
        <div className="flex gap-2 justify-center mt-4">
          {onRegenerate && (
            <Button variant="outline" onClick={onRegenerate}>
              <RefreshCw size={16} className="mr-2" />
              {t('characters:actions.generate_portrait')}
            </Button>
          )}
          <Button variant="ghost">
            <Upload size={16} className="mr-2" />
            {t('characters:portrait.upload_manual')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">
          {t('characters:portrait.options_title')}
        </h4>
        {onRegenerate && (
          <Button variant="ghost" size="sm" onClick={onRegenerate}>
            <RefreshCw size={14} className="mr-1" />
            {t('characters:actions.regenerate')}
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {t('characters:portrait.select_hint')}
      </p>

      {/* Media Lightbox */}
      <MediaLightbox
        isOpen={viewerIndex !== null}
        onClose={() => { setViewerIndex(null); }}
        initialIndex={viewerIndex ?? 0}
        items={portraits.map(p => ({
          id: p.id || p.url,
          url: p.url,
          title: p.prompt,
          isSelected: selectedUrl === p.url || masterPortraitUrl === p.url || p.isSelected
        }))}
        onSelect={(item) => { handleSelect(item.url); }}
      />

      {/* Portrait Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {portraits.map((portrait, index) => {
          const isSelected = selectedUrl === portrait.url || masterPortraitUrl === portrait.url || portrait.isSelected;
          const isMaster = masterPortraitUrl === portrait.url || portrait.isSelected;

            return (
              <div key={portrait.id || index} className="relative group aspect-square">
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => { handleSelect(portrait.url); }}
                  disabled={isSelectingMaster}
                  className={`
                    w-full h-full relative rounded-lg overflow-hidden border-2 transition-all
                    ${isSelected 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border hover:border-primary/50'}
                    ${isSelectingMaster ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
                  `}
                >
                  <img
                    src={portrait.url}
                    alt={`Portrait option ${String(index + 1)}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Master Badge */}
                  {isMaster && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                      <Check size={12} />
                      {t('characters:portrait.master_label')}
                    </div>
                  )}

                  {/* Selection Indicator */}
                  {isSelected && !isMaster && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground p-2 rounded-full">
                        <Check size={20} />
                      </div>
                    </div>
                  )}
                </motion.button>
                
                {/* View Button - Only visible on hover */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewerIndex(index);
                  }}
                >
                  <Maximize2 size={14} />
                </Button>
              </div>
          );
        })}
      </div>
    </div>
  );
};
