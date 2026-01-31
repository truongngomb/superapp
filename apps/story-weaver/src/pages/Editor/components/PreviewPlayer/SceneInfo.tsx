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
    status === 'prompt_ready' ? 'secondary' : 'default';

  return (
    <div className="px-4 py-3 bg-card/80 backdrop-blur-sm border border-border rounded-lg space-y-2">
      {/* Top row: Scene info + Download */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Scene number */}
          <span className="font-medium text-sm">
            {t('video_projects:preview.scene_of', { 
              current: sceneIndex + 1, 
              total: totalScenes
            })}
          </span>
          
          {/* Status badge */}
          <Badge variant={statusVariant} size="sm" className="capitalize">
            {t(`video_projects:status.${status}`)}
          </Badge>
          
          {/* Duration */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            <span>{scene.estimatedDuration || extendedScene.estimatedDuration || 3}s</span>
          </div>
        </div>

        {/* Download button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={!canDownload}
          className="gap-1.5 shrink-0"
        >
          <Download size={14} />
          <span className="hidden sm:inline">
            {hasVideo 
              ? t('video_projects:preview.download_clip')
              : t('video_projects:preview.download_image')
            }
          </span>
          {hasVideo ? <Film size={12} /> : <ImageIcon size={12} />}
        </Button>
      </div>

      {/* Script text preview */}
      {(scene.scriptText || extendedScene.voiceover) && (
        <p className="text-xs text-muted-foreground line-clamp-2 italic">
          "{scene.scriptText || extendedScene.voiceover}"
        </p>
      )}
    </div>
  );
};
