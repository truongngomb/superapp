import { useVideoScenes, useDeleteVideoScene } from '@/hooks/useScenes';
import { SceneCard } from './SceneCard';
import { Button } from '@superapp/ui-kit';
import { Plus } from 'lucide-react';

interface SceneListProps {
    projectId: string;
}

export const SceneList = ({ projectId }: SceneListProps) => {
    const { scenes, isLoading } = useVideoScenes(projectId);
    const { mutate: deleteScene } = useDeleteVideoScene();

    if (isLoading) return <div>Loading scenes...</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Timeline</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2">
                {scenes.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                        No scenes yet. Add one to start.
                    </div>
                ) : (
                    scenes.map((scene, index) => (
                        <SceneCard 
                            key={scene.id} 
                            scene={scene} 
                            index={index} 
                            onDelete={deleteScene}
                        />
                    ))
                )}
                
                <Button variant="outline" className="w-full mt-4 border-dashed">
                    <Plus size={16} className="mr-2" /> Add Scene
                </Button>
            </div>
        </div>
    );
};
