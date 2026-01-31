/**
 * PlaybackControls Component
 * 
 * Controls for preview player:
 * - Previous/Next scene navigation
 * - Slideshow toggle
 */
import { useTranslation } from 'react-i18next';
import { Button } from '@superapp/ui-kit';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

interface PlaybackControlsProps {
  // Navigation
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  currentIndex: number;
  total: number;
  
  // Slideshow
  isSlideshowActive: boolean;
  onToggleSlideshow: () => void;
}

export const PlaybackControls = ({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  currentIndex,
  total,
  isSlideshowActive,
  onToggleSlideshow,
}: PlaybackControlsProps) => {
  const { t } = useTranslation(['video_projects']);

  const canNavigate = total > 0;

  return (
    <div className="flex items-center justify-center gap-4 px-4 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg">
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrev}
        disabled={!canNavigate || (!hasPrev && !isSlideshowActive)}
        className="h-10 w-10"
        title={t('video_projects:preview.prev')}
      >
        <ChevronLeft size={20} />
      </Button>

      {/* Center: Slideshow Toggle + Scene Counter */}
      <div className="flex items-center gap-3">
        <Button
          variant={isSlideshowActive ? 'primary' : 'outline'}
          size="sm"
          onClick={onToggleSlideshow}
          disabled={total === 0}
          className="gap-2"
        >
          {isSlideshowActive ? (
            <>
              <Pause size={14} />
              <span className="hidden sm:inline">
                {t('video_projects:preview.slideshow_on')}
              </span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span className="hidden sm:inline">
                {t('video_projects:preview.slideshow_off')}
              </span>
            </>
          )}
        </Button>

        {/* Scene Counter */}
        <span className="text-sm text-muted-foreground tabular-nums">
          {currentIndex >= 0 ? currentIndex + 1 : '-'} / {total}
        </span>
      </div>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!canNavigate || (!hasNext && !isSlideshowActive)}
        className="h-10 w-10"
        title={t('video_projects:preview.next')}
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );
};
