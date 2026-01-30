/**
 * StoryboardPanel Component
 * 
 * The main "Production" view (Step 3).
 * displaying scenes as a storyboard grid.
 * Allows quick access to visual and motion generation.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Clapperboard, 
  Image as ImageIcon, 
  Film, 
  AlertCircle,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { 
  Button, 
  Card, 
  EmptyState, 
  Badge,
  LoadingSpinner,
  ConfirmModal
} from '@superapp/ui-kit';
import { useVideoScenes, useDeleteVideoScene } from '@/hooks';
import { SceneEditor } from '../ScriptEditor/SceneEditor';
import { videoSceneService } from '@/services/scene.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/config/queryClient';
import type { VideoScene } from '@/types';
import type { ExtendedScene } from '@/types/scene-script';

interface StoryboardPanelProps {
  projectId: string;
}

export const StoryboardPanel = ({ projectId }: StoryboardPanelProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);
  const queryClient = useQueryClient();
  
  // Data
  const { scenes, isLoading } = useVideoScenes(projectId);
  const deleteScene = useDeleteVideoScene();
  
  // State
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  
  // Derived state
  const editingScene = scenes.find(s => s.id === editingSceneId);

  // Update mutation (reused from/similar to ScriptEditorPanel)
  const updateMutation = useMutation({
    mutationFn: async ({ sceneId, data }: { sceneId: string; data: Partial<VideoScene> }) => {
      return await videoSceneService.update(sceneId, data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ 
        queryKey: queryKeys.videoScenes.byProject(projectId) 
      });
    },
  });

  const handleSaveScene = async (sceneId: string, data: Partial<VideoScene>) => {
    await updateMutation.mutateAsync({ sceneId, data });
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-muted/10">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2 shrink-0">
        <div>
          <h3 className="font-semibold text-2xl flex items-center gap-2">
            <Clapperboard className="text-primary" />
            {t('video_projects:storyboard.title', { defaultValue: 'Storyboard & Production' })}
          </h3>
          <p className="text-muted-foreground mt-1">
            {t('video_projects:storyboard.subtitle', { defaultValue: 'Generate visuals and motion for each scene.' })}
          </p>
        </div>
        <div className="flex gap-2">
           <Badge variant="secondary" className="px-3 py-1 text-sm">
              {scenes.length} {t('video_projects:storyboard.scenes_count', { defaultValue: 'Scenes' })}
           </Badge>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {scenes.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title={t('video_projects:storyboard.empty_title', { defaultValue: 'No scenes yet' })}
            description={t('video_projects:storyboard.empty_desc', { defaultValue: 'Go back to the Script tab to generate your story scenes first.' })}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
            {scenes.map((scene, index) => (
              <StoryboardCard 
                key={scene.id}
                scene={scene}
                index={index}
                onEdit={() => { setEditingSceneId(scene.id); }}
                onDelete={() => { setDeleteTargetId(scene.id); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Scene Editor Modal/Overlay */}
      <AnimatePresence>
        {editingScene && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background w-full max-w-4xl h-[90vh] rounded-xl shadow-2xl overflow-hidden"
            >
              <SceneEditor
                scene={editingScene}
                index={scenes.findIndex(s => s.id === editingSceneId)}
                onSave={handleSaveScene}
                onClose={() => { setEditingSceneId(null); }}
                isSubmitting={updateMutation.isPending}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onCancel={() => { setDeleteTargetId(null); }}
        onConfirm={() => {
            if (deleteTargetId) {
                deleteScene.mutate(deleteTargetId, {
                    onSuccess: () => { setDeleteTargetId(null); }
                });
            }
        }}
        title={t('video_projects:editor.delete_scene_title')}
        message={t('video_projects:editor.delete_scene_message')}
        confirmText={t('uikit:delete')}
        variant="danger"
        loading={deleteScene.isPending}
      />
    </div>
  );
};


interface StoryboardCardProps {
  scene: VideoScene;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const StoryboardCard = ({ scene, index, onEdit, onDelete }: StoryboardCardProps) => {
  const { t } = useTranslation(['video_projects', 'uikit']);
  const extendedScene = scene as unknown as ExtendedScene;
  
  // Determine state
  const hasImage = !!(extendedScene.selectedKeyframe || extendedScene.imageUrl);
  const hasVideo = !!extendedScene.videoClipUrl;
  
  return (
    <Card className="overflow-hidden group flex flex-col h-full border-border/50 hover:border-primary/50 transition-colors">
      {/* Thumbnail Area */}
      <div 
        className="aspect-video bg-muted relative cursor-pointer"
        onClick={onEdit}
      >
        {hasImage ? (
          <img 
            src={extendedScene.selectedKeyframe || extendedScene.imageUrl} 
            alt={`Scene ${String(index + 1)}`} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
            <ImageIcon size={32} className="mb-2 opacity-50" />
            <span className="text-xs font-medium">{t('video_projects:visuals.no_image', { defaultValue: 'No Image' })}</span>
          </div>
        )}

        {/* Status Overlay */}
        <div className="absolute top-2 right-2 flex gap-1">
          {hasVideo && (
            <Badge variant="success" className="h-6 px-1.5 shadow-sm">
              <Film size={12} className="mr-1" /> OK
            </Badge>
          )}
          {!hasVideo && hasImage && (
             <Badge variant="secondary" className="h-6 px-1.5 shadow-sm bg-background/80 backdrop-blur-md">
               <ImageIcon size={12} className="mr-1" /> IMG
             </Badge>
          )}
          {!hasImage && (
             <Badge variant="warning" className="h-6 px-1.5 shadow-sm">
               <AlertCircle size={12} className="mr-1" /> TODO
             </Badge>
          )}
        </div>

        {/* Scene Number */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold backdrop-blur-sm">
            {index + 1}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button variant="secondary" size="sm" className="shadow-lg">
                {hasImage ? t('uikit:edit') : t('video_projects:visuals.generate_now', { defaultValue: 'Generate' })}
             </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 flex-1 flex flex-col space-y-2">
        <div className="flex justify-between items-start gap-2">
             <p className="text-xs text-muted-foreground line-clamp-3 italic flex-1">
                "{scene.scriptText || scene.visualPrompt || '...'}"
             </p>
             <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit} title={t('uikit:edit')}>
                    <Edit size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500" onClick={onDelete} title={t('uikit:delete')}>
                    <Trash2 size={14} />
                </Button>
             </div>
        </div>

        <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50">
             <div className="flex items-center gap-1">
                <Clock size={10} />
                {scene.estimatedDuration || 0}s
             </div>
             <div>
                {scene.cameraMovement?.replace('_', ' ') || 'Static'}
             </div>
        </div>
      </div>
    </Card>
  );
};
