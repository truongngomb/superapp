/**
 * PreviewPlayer Component
 * 
 * Main preview player for the Editor page.
 * Displays:
 * - Final rendered video (if available)
 * - Selected scene preview (video clip or image)
 * - Playback controls and scene info
 */
import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '@superapp/ui-kit';
import { Play, Image as ImageIcon } from 'lucide-react';

import { usePreviewContext } from '../../context';
import { PlaybackControls } from './PlaybackControls';
import { SceneInfo } from './SceneInfo';
import type { VideoProject } from '@/types';
import type { ExtendedScene } from '@/types/scene-script';

interface PreviewPlayerProps {
  project: VideoProject;
}

export const PreviewPlayer = ({ project }: PreviewPlayerProps) => {
  const { t } = useTranslation(['video_projects']);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const {
    currentScene,
    currentSceneIndex,
    scenes,
    goToNextScene,
    goToPrevScene,
    hasPrev,
    hasNext,
    isSlideshowActive,
    toggleSlideshow,
  } = usePreviewContext();

  const extendedScene = currentScene as unknown as ExtendedScene | null;

  // Determine what to display
  const hasFinalVideo = !!project.outputUrl;
  const isRendering = project.status === 'rendering';
  
  // Scene media
  const sceneVideoUrl = extendedScene?.videoClipUrl;
  const sceneImageUrl = extendedScene?.selectedKeyframe || extendedScene?.imageUrl || currentScene?.imageUrl;
  const hasSceneVideo = !!sceneVideoUrl;
  const hasSceneImage = !!sceneImageUrl;
  const hasSceneMedia = hasSceneVideo || hasSceneImage;

  // Pause video when slideshow switches scenes
  useEffect(() => {
    if (videoRef.current && !isSlideshowActive) {
      videoRef.current.pause();
    }
  }, [currentSceneIndex, isSlideshowActive]);

  // Render content based on state
  const renderContent = () => {
    // 1. Final rendered video
    if (hasFinalVideo) {
      return (
        <video
          ref={videoRef}
          src={project.outputUrl}
          controls
          className="w-full h-full object-contain"
          autoPlay={false}
        />
      );
    }

    // 2. Rendering in progress
    if (isRendering) {
      return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" className="text-primary mb-4" />
          <p className="text-white text-sm font-medium animate-pulse">
            {t('video_projects:editor.rendering')}
          </p>
        </div>
      );
    }

    // 3. Scene with video clip
    if (hasSceneVideo && sceneVideoUrl) {
      return (
        <video
          ref={videoRef}
          src={sceneVideoUrl}
          controls
          className="w-full h-full object-contain"
          autoPlay={isSlideshowActive}
          muted={isSlideshowActive}
          loop={false}
        />
      );
    }

    // 4. Scene with image
    if (hasSceneImage && sceneImageUrl) {
      return (
        <motion.img
          key={sceneImageUrl}
          src={sceneImageUrl}
          alt={`Scene ${String(currentSceneIndex + 1)}`}
          className="w-full h-full object-contain"
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      );
    }

    // 5. Scene selected but no media
    if (currentScene) {
      return (
        <div className="flex flex-col items-center justify-center text-white/50 p-8 text-center">
          <ImageIcon size={48} className="mb-4 opacity-30" />
          <p className="text-sm">
            {t('video_projects:preview.no_visual')}
          </p>
          <p className="text-xs mt-2 opacity-60">
            {t('video_projects:preview.generate_hint')}
          </p>
        </div>
      );
    }

    // 6. No scene selected
    return (
      <div className="flex flex-col items-center justify-center text-white/50 p-8 text-center">
        <Play size={48} className="mb-4 opacity-20" />
        <p className="text-sm">
          {t('video_projects:preview.select_scene')}
        </p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      {/* Top: Scene Info */}
      <div className="shrink-0 mb-4">
        {currentScene ? (
          <SceneInfo
            scene={currentScene}
            sceneIndex={currentSceneIndex}
            totalScenes={scenes.length}
          />
        ) : (
          <div className="h-[72px]" /> // Placeholder để giữ layout
        )}
      </div>

      {/* Center: Preview Container - 9:16 aspect ratio */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="relative h-full max-h-full aspect-[9/16] bg-black rounded-xl shadow-2xl overflow-hidden border border-border/50">
          {/* Media Area - fills entire container */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-b from-neutral-900 to-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene?.id || 'empty'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>

            {/* Media type indicator */}
            {hasSceneMedia && !hasFinalVideo && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white/80 z-10">
                {hasSceneVideo ? (
                  <>
                    <span>{t('video_projects:preview.download_clip')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('video_projects:preview.download_image')}</span>
                  </>
                )}
              </div>
            )}

            {/* Slideshow indicator */}
            {isSlideshowActive && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-primary/80 backdrop-blur-sm rounded-full text-xs text-primary-foreground z-10">
                <Play size={10} className="animate-pulse" />
                <span>{t('video_projects:preview.auto')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Playback Controls */}
      <div className="shrink-0 mt-4">
        <PlaybackControls
          onPrev={goToPrevScene}
          onNext={goToNextScene}
          hasPrev={hasPrev}
          hasNext={hasNext}
          currentIndex={currentSceneIndex}
          total={scenes.length}
          isSlideshowActive={isSlideshowActive}
          onToggleSlideshow={toggleSlideshow}
        />
      </div>
    </div>
  );
};
