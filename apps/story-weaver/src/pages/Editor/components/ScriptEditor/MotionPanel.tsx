/**
 * MotionPanel Component
 * 
 * Sub-panel for generating and previewing motion clips for a scene.
 */

import { useTranslation } from 'react-i18next';
import { 
  Button, 
  Skeleton, 
  useToast,
} from '@superapp/ui-kit';
import { 
  Film,
  Sparkles, 
  Play,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { useMotionGeneration } from '@/hooks';
import type { ExtendedScene } from '@/types/scene-script';

interface MotionPanelProps {
  scene: ExtendedScene;
}

export const MotionPanel = ({
  scene,
}: MotionPanelProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);
  const toast = useToast();
  const { generateMotion, isGenerating } = useMotionGeneration();

  const handleAnimate = () => {
    generateMotion(
      { sceneId: scene.id, projectId: scene.projectId },
      {
        onSuccess: () => {
          toast.success(t('video_projects:motion.generate_success'));
        },
        onError: (error) => {
          const msg = error instanceof Error ? error.message : t('uikit:error.unknown');
          toast.error(`${t('video_projects:motion.generate_error')}: ${msg}`);
        }
      }
    );
  };

  const hasImage = !!(scene.selectedKeyframe || scene.imageUrl);
  const hasVideo = !!scene.videoClipUrl;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Film size={16} className="text-muted-foreground" />
            {t('video_projects:motion.title')}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {t('video_projects:motion.description')}
          </p>
        </div>
        {hasImage && (
          <Button 
            size="sm" 
            onClick={handleAnimate} 
            disabled={isGenerating}
            loading={isGenerating}
            variant="secondary"
          >
            <Sparkles size={14} className="mr-2" />
            {hasVideo 
              ? t('video_projects:motion.regenerate') 
              : t('video_projects:motion.generate')
            }
          </Button>
        )}
      </div>

      {!hasImage ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-muted/30">
          <AlertCircle className="h-10 w-10 text-amber-500 mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground text-center max-w-[250px]">
            {t('video_projects:motion.no_image_hint')}
          </p>
        </div>
      ) : isGenerating ? (
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full rounded-md" />
          <div className="flex items-center justify-center py-4">
            <p className="text-sm text-muted-foreground animate-pulse">
              {t('video_projects:motion.generating_hint')}
            </p>
          </div>
        </div>
      ) : hasVideo ? (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-md overflow-hidden bg-black border border-border">
            <video 
              src={scene.videoClipUrl} 
              controls 
              className="w-full h-full"
              poster={scene.selectedKeyframe || scene.imageUrl}
            />
          </div>
          <div className="p-3 rounded-md bg-primary/5 border border-primary/10 flex items-start gap-3">
            <Play size={16} className="text-primary mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-primary">
                {t('video_projects:motion.ready_title')}
              </p>
              <p className="mt-0.5">
                {t('video_projects:motion.ready_desc')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-md overflow-hidden border border-border bg-muted/20">
            <img 
              src={scene.selectedKeyframe || scene.imageUrl} 
              alt="Scene preview" 
              className="w-full h-full object-cover opacity-60 grayscale-[50%]"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-background/80 flex items-center justify-center mb-3 shadow-sm border border-border">
                <ImageIcon className="text-primary" size={24} />
              </div>
              <p className="text-sm font-medium">
                {t('video_projects:motion.ready_to_animate')}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                {t('video_projects:motion.cta_hint')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
