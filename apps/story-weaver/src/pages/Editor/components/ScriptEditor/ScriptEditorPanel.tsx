/**
 * ScriptEditorPanel Component
 * 
 * Main panel for the Script Editor tab.
 * Combines scene list, scene editing, script generation, and validation.
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  FileText, 
  Edit3,
  GripVertical,
  Clock,
  Camera,
  AlertTriangle,
  Wand2
} from 'lucide-react';
import { 
  EmptyState,
  Badge,
  Avatar,
  Skeleton,
  Card,
  useToast,
  Button
} from '@superapp/ui-kit';
import { useVideoScenes } from '@/hooks/useScenes';
import { useCharacters } from '@/hooks/useCharacters';
import { useScriptValidation } from '@/hooks/useScriptValidation';
import { videoSceneService } from '@/services/scene.service';
import { queryKeys } from '@/config/queryClient';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import type { VideoScene, Character } from '@/types';
import type { VideoProject } from '@/types/video-project';
import { CAMERA_MOVEMENT, type ExtendedScene } from '@/types/scene-script';
import { VALIDATION_SEVERITY } from '@/types/scene-script';
import { useMemo } from 'react';

import { GenerateScriptButton } from './GenerateScriptButton';
import { ValidationPanel } from './ValidationPanel';
import { SceneEditor } from './SceneEditor';

interface ScriptEditorPanelProps {
  project: VideoProject;
}

// Compact scene card for script editing
interface SceneScriptCardProps {
  scene: VideoScene;
  index: number;
  isSelected: boolean;
  hasError: boolean;
  hasWarning: boolean;
  onSelect: () => void;
  allCharacters: Character[];
}

const SceneScriptCard = ({ 
  scene, 
  index, 
  isSelected,
  hasError,
  hasWarning,
  onSelect,
  allCharacters
}: SceneScriptCardProps) => {
  const { t } = useTranslation(['video_projects']);
  const extendedScene = scene as unknown as ExtendedScene;
  
  const voiceover = extendedScene.voiceover ?? extendedScene.scriptText ?? '';
  const duration = extendedScene.estimatedDuration ?? extendedScene.duration ?? 0;
  const camera = extendedScene.cameraMovement ?? CAMERA_MOVEMENT.STATIC;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`
          p-3 cursor-pointer transition-all group
          ${isSelected 
            ? '!border-primary bg-primary/5 shadow-sm' 
            : 'hover:bg-muted/50'
          }
          ${hasError ? '!border-red-500/50' : hasWarning ? '!border-amber-500/50' : ''}
        `}
        onClick={onSelect}
      >
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <div className="text-muted-foreground mt-1 cursor-move">
            <GripVertical size={16} />
          </div>

          {/* Scene Number */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
            {index + 1}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {t('video_projects:editor.scene_label', { index: index + 1 })}
              </span>
              {hasError && (
                <Badge variant="danger" size="sm" className="gap-1">
                  <AlertTriangle size={10} />
                  {t('video_projects:script.has_errors')}
                </Badge>
              )}
              {!hasError && hasWarning && (
                <Badge variant="warning" size="sm" className="gap-1">
                  <AlertTriangle size={10} />
                  {t('video_projects:script.has_warnings')}
                </Badge>
              )}
            </div>
            
            {/* Voiceover preview */}
            <p className="text-xs text-muted-foreground line-clamp-2">
              {voiceover || (
                <span className="italic">{t('video_projects:editor.no_script')}</span>
              )}
            </p>

            {/* Characters */}
            {extendedScene.characterIds && extendedScene.characterIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {extendedScene.characterIds.map((charId) => {
                  const char = allCharacters.find((c) => c.id === charId);
                  if (!char) return null;
                  return (
                    <div 
                      key={char.id} 
                      className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-medium text-primary/80"
                    >
                      <Avatar
                        src={char.masterPortraitUrl}
                        name={char.name}
                        className="w-3.5 h-3.5 border-0 ring-0"
                      />
                      <span>{char.name}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Meta info */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {String(duration)}{t('video_projects:script.seconds_short')}
              </span>
              <span className="flex items-center gap-1">
                <Camera size={12} />
                {camera.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Edit indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit3 size={16} className="text-muted-foreground" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const ScriptEditorPanel = ({ project }: ScriptEditorPanelProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);
  const queryClient = useQueryClient();
  
  // Fetch scenes and characters
  const { scenes, isLoading: isLoadingScenes } = useVideoScenes(project.id);
  const { data: characters, isLoading: isLoadingCharacters } = useCharacters(project.id);
  
  const characterIds = useMemo(() => 
    (characters || []).map(c => c.id), 
    [characters]
  );

  // Validation
  const { validation } = useScriptValidation({ 
    scenes, 
    project,
    characterIds
  });
  
  // Selected scene for editing
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const selectedScene = scenes.find(s => s.id === selectedSceneId);

  // Update scene mutation
  const updateMutation = useMutation({
    mutationFn: async ({ sceneId, data }: { sceneId: string; data: Partial<VideoScene> }) => {
      return await videoSceneService.update(sceneId, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.videoScenes.byProject(project.id) 
      });
    },
  });

  const handleUpdateScene = useCallback(async (sceneId: string, data: Partial<VideoScene>) => {
    await updateMutation.mutateAsync({ sceneId, data });
  }, [updateMutation]);

  // --- Auto Match Logic ---
  const [isAutoMatching, setIsAutoMatching] = useState(false);
  const [hasPerformedAutoMatch, setHasPerformedAutoMatch] = useState(false);
  const toast = useToast();

  const handleAutoMatchAll = useCallback(() => {
    if (scenes.length === 0 || !characters || characters.length === 0) return;
      
    setIsAutoMatching(true);
    // TODO: Connect to Real Backend API (scriptService.autoMatchCharacters or similar)
    // For now, simulating API call
    setTimeout(() => {
        setIsAutoMatching(false);
        setHasPerformedAutoMatch(true);
        toast.success(t('video_projects:script.auto_match_success'));
        // In real impl, we would invalidate queries here
    }, 1500);
      
  }, [scenes, characters, toast, t]);

  // Check if any scene has characters assigned
  const hasAssignedCharacters = useMemo(() => {
    return scenes.some(scene => {
       const s = scene as unknown as ExtendedScene;
       return Array.isArray(s.characterIds) && s.characterIds.length > 0;
    });
  }, [scenes]);

  const showAutoMatch = (!hasAssignedCharacters && !hasPerformedAutoMatch) || isAutoMatching;

  // Get validation issues per scene
  const getSceneIssues = (sceneId: string) => {
    return validation.issues.filter(i => i.sceneId === sceneId);
  };

  const hasSceneError = (sceneId: string) => {
    return getSceneIssues(sceneId).some(i => i.severity === VALIDATION_SEVERITY.ERROR);
  };

  const hasSceneWarning = (sceneId: string) => {
    return getSceneIssues(sceneId).some(i => i.severity === VALIDATION_SEVERITY.WARNING);
  };

  // Check if story content exists
  const hasStoryContent = !!project.storyContent && project.storyContent.trim().length > 0;

  if (isLoadingScenes || isLoadingCharacters) {
    return (
      <div className="flex h-full">
         <div className="w-1/3 flex flex-col p-2 space-y-4">
            <div className="flex justify-between items-center">
                 <Skeleton className="h-6 w-32" />
                 <Skeleton className="h-9 w-32" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3 border rounded-lg">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                    </div>
                </div>
            ))}
         </div>
         <div className="w-2/3 border-l pl-4 p-4 flex flex-col items-center justify-center">
             <Skeleton className="w-12 h-12 rounded mb-4" />
             <Skeleton className="h-4 w-48 mb-2" />
             <Skeleton className="h-3 w-64" />
         </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left: Scene List */}
      <div className="w-1/3 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText size={18} />
            {t('video_projects:script.title')}
          </h3>
          <GenerateScriptButton
            projectId={project.id}
            hasExistingScenes={scenes.length > 0}
            disabled={!hasStoryContent}
          />
          {showAutoMatch && (
            <Button
                variant="ghost"
                size="icon"
                onClick={handleAutoMatchAll}
                loading={isAutoMatching}
                disabled={scenes.length === 0 || (characters || []).length === 0}
                title={t('video_projects:script.auto_match')}
            >
                <Wand2 size={18} />
            </Button>
          )}
        </div>

        {/* No story warning */}
        {!hasStoryContent && (
          <Card className="p-4 mb-4 border-amber-500/50 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">
                  {t('video_projects:script.no_story_title')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('video_projects:script.no_story_desc')}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Scene List */}
        <div className="flex-1 overflow-y-auto px-4 flex gap-4 flex-col">
          {scenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <EmptyState
                icon={FileText}
                title={t('video_projects:script.no_scenes_title')}
                description={
                  hasStoryContent 
                    ? t('video_projects:script.no_scenes_desc') 
                    : t('video_projects:script.no_story_desc')
                }
                className="w-full"
              />
              {hasStoryContent && (
                <div className="mt-4">
                  <GenerateScriptButton
                    projectId={project.id}
                    hasExistingScenes={false}
                  />
                </div>
              )}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {scenes.map((scene, index) => (
                <SceneScriptCard
                  key={scene.id}
                  scene={scene}
                  index={index}
                  isSelected={selectedSceneId === scene.id}
                  hasError={hasSceneError(scene.id)}
                  hasWarning={hasSceneWarning(scene.id)}
                  onSelect={() => { setSelectedSceneId(scene.id); }}
                  allCharacters={characters || []}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Validation Panel */}
        {scenes.length > 0 && (
          <div className="p-4">
            <ValidationPanel validation={validation} />
          </div>
        )}
      </div>

      {/* Right: Scene Editor */}
      <div className="w-2/3 border-l border-border pl-4">
        <AnimatePresence mode="wait">
          {selectedScene ? (
            <SceneEditor
              key={selectedScene.id}
              scene={selectedScene}
              index={scenes.findIndex(s => s.id === selectedScene.id)}
              availableCharacters={characters}
              onSave={handleUpdateScene}
              onClose={() => { setSelectedSceneId(null); }}
              isSubmitting={updateMutation.isPending}
              allowedTabs={['script']}
            />
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col items-center justify-center text-center text-muted-foreground"
            >
              <Edit3 size={48} className="mb-4 opacity-30" />
              <p className="font-medium">
                {t('video_projects:script.select_scene_title')}
              </p>
              <p className="text-sm mt-1">
                {t('video_projects:script.select_scene_desc')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
