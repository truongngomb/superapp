/**
 * SceneInfo Component
 * 
 * Displays information about the current scene:
 * - Scene number and status
 * - Duration
 * - Script text preview
 * - Download button for clip/image
 */
import { useTranslation } from 'react-i18next';
import { Button, Badge } from '@superapp/ui-kit';
import { Download, Clock, Film, Image as ImageIcon } from 'lucide-react';
import type { VideoScene } from '@/types';
import type { ExtendedScene } from '@/types/scene-script';

interface SceneInfoProps {
  scene: VideoScene;
  sceneIndex: number;
  totalScenes: number;
}

export const SceneInfo = ({ scene, sceneIndex, totalScenes }: SceneInfoProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);
  
  const extendedScene = scene as unknown as ExtendedScene;
  
  // Determine what can be downloaded
  const videoUrl = extendedScene.videoClipUrl;
  const imageUrl = extendedScene.selectedKeyframe || extendedScene.imageUrl || scene.imageUrl;
  const canDownload = !!(videoUrl || imageUrl);
  const hasVideo = !!videoUrl;

  const handleDownload = () => {
    const url = videoUrl || imageUrl;
    if (!url) return;

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `scene-${String(sceneIndex + 1)}.${hasVideo ? 'mp4' : 'png'}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scene status - extendedScene.status is required in ExtendedScene type
  const status = extendedScene.status;
  const statusVariant = 
    status === 'video_ready' ? 'success' :
    status === 'visual_ready' ? 'primary' :
    status === 'prompt_ready' ? 'warning' : 'default';

  return (
    <div className="flex flex-col gap-4">
      {/* Header: Scene Info & Download */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-2xl font-bold leading-none mb-1">
            {t('video_projects:editor.scene_label', { index: sceneIndex + 1 })}
          </h4>
          <span className="text-sm text-muted-foreground">
             {t('video_projects:preview.scene_of', { current: sceneIndex + 1, total: totalScenes }).split('Scene')[1]?.trim() || `of ${String(totalScenes)}`}
          </span>
        </div>
        
        {/* Download button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          disabled={!canDownload}
          className="gap-2 h-9"
        >
          {hasVideo ? <Film size={14} /> : <ImageIcon size={14} />}
          <span className="text-xs">
            {hasVideo 
              ? t('video_projects:preview.download')
              : t('video_projects:preview.download')
            }
          </span>
          <Download size={12} className="ml-1 opacity-70" />
        </Button>
      </div>

      {/* Meta: Status & Duration */}
      <div className="flex items-center gap-3">
        <Badge variant={statusVariant} className="px-3 py-1 text-xs font-medium capitalize">
          {t(`video_projects:status.${status}`)}
        </Badge>
        
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
          <Clock size={14} />
          <span className="font-medium">{scene.estimatedDuration || extendedScene.estimatedDuration || 3}s</span>
        </div>
      </div>
    </div>
  );
};
