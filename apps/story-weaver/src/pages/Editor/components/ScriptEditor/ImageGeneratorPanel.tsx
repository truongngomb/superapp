/**
 * ImageGeneratorPanel Component
 * 
 * Sub-panel for generating and selecting visual keyframes for a scene.
 */

import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Skeleton, 
  useToast,
  Badge
} from '@superapp/ui-kit';
import { 
  Sparkles, 
  RefreshCw, 
  Image as ImageIcon, 
  CheckCircle, 
} from 'lucide-react';
import { useImageGeneration } from '@/hooks';
import type { ExtendedScene, KeyframeOption } from '@/types/scene-script';

interface ImageGeneratorPanelProps {
  scene: ExtendedScene;
  onUpdate: (updates: Partial<ExtendedScene>) => void;
}

export const ImageGeneratorPanel = ({
  scene,
  onUpdate
}: ImageGeneratorPanelProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);
  const toast = useToast();
  const { generateImages, isGenerating } = useImageGeneration();

  // Determine active keyframe URL logic
  const activeKeyframeUrl = scene.selectedKeyframe ?? scene.videoClipUrl ?? scene.imageUrl;

  const handleGenerate = () => {
    generateImages(
      { sceneId: scene.id, projectId: scene.projectId },
      {
        onSuccess: () => {
          toast.success(t('video_projects:visuals.generate_success'));
        },
        onError: (error) => {
          const msg = error instanceof Error ? error.message : t('uikit:error.unknown');
          toast.error(`${t('video_projects:visuals.generate_error')}: ${msg}`);
        }
      }
    );
  };

  const handleSelect = (option: KeyframeOption) => {
    onUpdate({
      selectedKeyframe: option.url,
      // Also update legacy field for compatibility if needed
      imageUrl: option.url, 
      visualPrompt: option.prompt
    });
    toast.success(t('video_projects:visuals.selected'));
  };

  const hasOptions = scene.keyframeOptions && scene.keyframeOptions.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2">
            <ImageIcon size={16} className="text-muted-foreground" />
            {t('video_projects:visuals.generated_keyframes')}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {t('video_projects:visuals.select_hint')}
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={handleGenerate} 
          disabled={isGenerating}
          loading={isGenerating}
          variant="secondary"
        >
          {hasOptions ? (
             <><RefreshCw size={14} className="mr-2" /> {t('video_projects:visuals.regenerate')}</>
          ) : (
             <><Sparkles size={14} className="mr-2" /> {t('video_projects:visuals.generate')}</>
          )}
        </Button>
      </div>

      {isGenerating ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-video w-full rounded-md" />
          ))}
        </div>
      ) : hasOptions ? (
        <div className="grid grid-cols-2 gap-4">
          {scene.keyframeOptions?.map((option) => {
            const isSelected = option.url === activeKeyframeUrl;
            
            return (
              <div 
                key={option.id} 
                className={`group relative aspect-video rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-muted-foreground/50'
                }`}
                onClick={() => { handleSelect(option); }}
              >
                <img 
                  src={option.url} 
                  alt={option.prompt} 
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay on Hover / Selected */}
                <div className={`absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  {isSelected && (
                    <Badge variant="default" className="bg-primary text-primary-foreground absolute top-2 right-2">
                      <CheckCircle size={12} className="mr-1" />
                      {t('video_projects:visuals.selected')}
                    </Badge>
                  )}
                  
                  {/* Prompt Text (Simple overlay since Tooltip is likely missing) */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                     <p className="text-[10px] text-white/90 truncate">
                       {option.prompt}
                     </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg bg-muted/30">
          <ImageIcon className="h-10 w-10 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground text-center max-w-[200px]">
            {t('video_projects:visuals.empty_state')}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-4"
            onClick={handleGenerate}
          >
            {t('video_projects:visuals.generate_now')}
          </Button>
        </div>
      )}
    </div>
  );
};
