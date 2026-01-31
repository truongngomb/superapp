/**
 * PortraitGallery Component
 * 
 * Displays 4 portrait options for selection with master portrait indicator.
 * Supports "Candidate Selection" logic for safe master updates.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MediaLightbox, Button, LoadingSpinner } from '@superapp/ui-kit';
import { Check, RefreshCw, Maximize2, Star, Save } from 'lucide-react';
import type { PortraitOption } from '@/types';

interface PortraitGalleryProps {
  portraits: PortraitOption[];
  masterPortraitUrl?: string;
  selectedCandidateUrl?: string | null;
  onSelectMaster: (portraitUrl: string) => void;
  onSelectCandidate: (portraitUrl: string) => void;
  onRegenerate?: () => void;
  isGenerating?: boolean;
  isSelectingMaster?: boolean;
  isLoading?: boolean;
}

export const PortraitGallery = ({
  portraits,
  masterPortraitUrl,
  selectedCandidateUrl,
  onSelectMaster,
  onSelectCandidate,
  onRegenerate,
  isGenerating,
  isSelectingMaster,
  isLoading = false,
}: PortraitGalleryProps) => {
  const { t } = useTranslation(['characters', 'uikit']);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  // We rely on parent to pass selectedCandidateUrl. 
  // Parent should initialize it with masterPortraitUrl.

  const isDirty = selectedCandidateUrl && selectedCandidateUrl !== masterPortraitUrl;

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center h-full">
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
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {Array.from({ length: 4 }).map((_, i) => (
             <div key={i} className="aspect-square bg-muted-foreground/10 rounded-lg animate-pulse" />
           ))}
         </div>
       </div>
     );
  }

  if (portraits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12 text-muted-foreground">
        <div className="bg-muted p-4 rounded-full mb-4">
            <RefreshCw size={24} className="opacity-50"/>
        </div>
        <p className="mb-4">{t('characters:portrait.no_portraits')}</p>
        <div className="flex gap-2 justify-center">
          {onRegenerate && (
            <Button onClick={onRegenerate}>
              <RefreshCw size={16} className="mr-2" />
              {t('characters:actions.generate_portrait')}
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
            <h4 className="font-medium text-sm">
            {t('characters:portrait.options_title')}
            </h4>
            <p className="text-xs text-muted-foreground">
            {t('characters:portrait.select_hint')}
            </p>
        </div>

        <div className="flex gap-2">
            {isDirty && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Button 
                        size="sm" 
                        onClick={() => {
                            if (selectedCandidateUrl) onSelectMaster(selectedCandidateUrl);
                        }}
                        loading={isSelectingMaster}
                        className="gap-2"
                    >
                        <Save size={14} />
                        {t('characters:actions.save_master')}
                    </Button>
                </motion.div>
            )}
            
            {onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate} disabled={isSelectingMaster}>
                <RefreshCw size={14} className="mr-1" />
                {t('characters:actions.regenerate')}
            </Button>
            )}
        </div>
      </div>

      {/* Media Lightbox */}
      <MediaLightbox
        isOpen={viewerIndex !== null}
        onClose={() => { setViewerIndex(null); }}
        initialIndex={viewerIndex ?? 0}
        items={portraits.map(p => ({
          id: p.id || p.url,
          url: p.url,
          title: p.prompt,
          isSelected: selectedCandidateUrl === p.url
        }))}
        onSelect={(item) => { onSelectCandidate(item.url); }}
      />

      {/* Portrait Grid - Scalable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-2">
        {portraits.map((portrait, index) => {
          const isSelectedCandidate = selectedCandidateUrl === portrait.url;
          const isMaster = masterPortraitUrl === portrait.url;

            return (
              <div key={portrait.id || index} className="relative group aspect-[2/3] md:aspect-square">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onSelectCandidate(portrait.url); }}
                  disabled={isSelectingMaster}
                  className={`
                    w-full h-full relative rounded-xl overflow-hidden transition-all shadow-sm
                    ${isSelectedCandidate 
                      ? 'ring-4 ring-primary border-transparent z-10' 
                      : 'border-2 border-transparent hover:border-primary/50'}
                  `}
                >
                  <img
                    src={portrait.url}
                    alt={t('characters:portrait.option_alt', { index: index + 1 })}
                    className="w-full h-full object-cover"
                  />

                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Master Badge (Crown) - Always Visible */}
                  {isMaster && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-md z-20">
                      <Star size={12} fill="currentColor" />
                      {t('characters:portrait.master_badge')}
                    </div>
                  )}

                  {/* Selection Indicator (Check) - Only Selected */}
                  {isSelectedCandidate && !isMaster && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full shadow-md z-20">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
                
                {/* View Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
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
