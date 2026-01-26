import { useVideoScenes, useDeleteVideoScene } from '@/hooks/useScenes';
import { SceneCard } from './SceneCard';
import { Button, EmptyState, ConfirmModal } from '@superapp/ui-kit';
import { Plus, Video } from 'lucide-react';
import { useState } from 'react';

interface SceneListProps {
    projectId: string;
}

export const SceneList = ({ projectId }: SceneListProps) => {
    const { scenes, isLoading } = useVideoScenes(projectId);
    const { mutate: deleteScene, isPending: isDeleting } = useDeleteVideoScene();
    const [deleteId, setDeleteId] = useState<string | null>(null);

    if (isLoading) return <div>Loading scenes...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Timeline</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
                {scenes.length === 0 ? (
                    <EmptyState
                        icon={Video}
                        title="No scenes yet"
                        description="Add your first scene to start building your video story."
                        className="py-10"
                    />
                ) : (
                    scenes.map((scene, index) => (
                        <SceneCard 
                            key={scene.id} 
                            scene={scene} 
                            index={index} 
                            onDelete={(id) => setDeleteId(id)}
                        />
                    ))
                )}
                
                <Button variant="outline" className="w-full mt-4 border-dashed">
                    <Plus size={16} className="mr-2" /> Add Scene
                </Button>
            </div>

            <ConfirmModal
                isOpen={!!deleteId}
                title="Delete Scene"
                message="Are you sure you want to delete this scene? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
                loading={isDeleting}
                onConfirm={() => {
                    if (deleteId) {
                        deleteScene(deleteId, {
                            onSuccess: () => setDeleteId(null)
                        });
                    }
                }}
                onCancel={() => setDeleteId(null)}
            />
        </div>
    );
};
