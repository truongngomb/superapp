import { VideoScene } from '@superapp/shared-types';
import { Card } from '@superapp/ui-kit';
import { GripVertical, Image as ImageIcon, Music as MusicIcon, Clock, Trash2 } from 'lucide-react';

interface SceneCardProps {
    scene: VideoScene;
    index: number;
    onDelete: (id: string) => void;
}

export const SceneCard = ({ scene, index, onDelete }: SceneCardProps) => {
    return (
        <Card className="p-4 mb-4 flex gap-4 items-start group relative">
            <div className="text-muted-foreground cursor-move mt-2">
                <GripVertical size={20} />
            </div>
            
            <div className="w-1/4 aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden border border-border">
                {scene.image_url ? (
                    <img src={scene.image_url} alt={`Scene ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                        <ImageIcon size={24} />
                        <span className="text-xs mt-1">No Image</span>
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold">Scene {index + 1}</h4>
                    <button 
                        onClick={() => onDelete(scene.id)}
                        className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                
                <p className="text-sm line-clamp-2">{scene.script_text || <span className="text-muted-foreground italic">No script content...</span>}</p>
                
                <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{scene.duration || 0}s</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MusicIcon size={12} />
                        <span>{scene.audio_url ? 'Has Audio' : 'No Audio'}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
