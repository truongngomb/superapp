import { useTranslation } from 'react-i18next';
import { useVideoScenes, useDeleteVideoScene } from '@/hooks/useScenes';
import { SceneCard } from './SceneCard';
import { Button, EmptyState, ConfirmModal } from '@superapp/ui-kit';
import { Plus, Video } from 'lucide-react';
import { useState } from 'react';

interface SceneListProps {
    projectId: string;
}

export const SceneList = ({ projectId }: SceneListProps) => {
    const { t } = useTranslation(['video_projects', 'uikit']);
    const { scenes, isLoading } = useVideoScenes(projectId);
    const { mutate: deleteScene, isPending: isDeleting } = useDeleteVideoScene();
    const [deleteId, setDeleteId] = useState<string | null>(null);

    if (isLoading) return <div className="p-4 text-center text-muted-foreground">{t('video_projects:editor.loading_scenes')}</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{t('video_projects:editor.timeline')}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
                {scenes.length === 0 ? (
                    <EmptyState
                        icon={Video}
                        title={t('video_projects:editor.no_scenes_title')}
                        description={t('video_projects:editor.no_scenes_desc')}
                        className="py-10"
                    />
                ) : (
                    scenes.map((scene, index) => (
                        <SceneCard 
                            key={scene.id} 
                            scene={scene} 
                            index={index} 
                            onDelete={(id) => { setDeleteId(id); }}
                        />
                    ))
                )}
                
                <Button variant="outline" className="w-full mt-4 border-dashed">
                    <Plus size={16} className="mr-2" /> {t('video_projects:editor.add_scene')}
                </Button>
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                title={t('video_projects:editor.delete_scene_title')}
                message={t('video_projects:editor.delete_scene_message')}
                confirmText={t('uikit:delete')}
                variant="danger"
                loading={isDeleting}
                onConfirm={() => {
                    if (deleteId) {
                        deleteScene(deleteId, {
                            onSuccess: () => { setDeleteId(null); }
                        });
                    }
                }}
                onCancel={() => { setDeleteId(null); }}
            />
        </div>
    );
};
