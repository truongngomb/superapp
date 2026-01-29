import { useTranslation } from 'react-i18next';
import { Card, Button } from '@superapp/ui-kit';
import { GripVertical, Image as ImageIcon, Music as MusicIcon, Clock, Trash2 } from 'lucide-react';
import { VideoScene } from '@/types';

interface SceneCardProps {
    scene: VideoScene;
    index: number;
    onDelete: (id: string) => void;
}

export const SceneCard = ({ scene, index, onDelete }: SceneCardProps) => {
    const { t } = useTranslation(['video_projects']);

    return (
        <Card className="p-4 mb-4 flex gap-4 items-start group relative">
            <div className="text-muted-foreground cursor-move mt-2">
                <GripVertical size={20} />
            </div>
            
            <div className="w-1/4 aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden border border-border">
                {scene.imageUrl ? (
                    <img src={scene.imageUrl} alt={t('video_projects:editor.scene_label', { index: index + 1 })} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center text-muted-foreground">
                        <ImageIcon size={24} />
                        <span className="text-xs mt-1">{t('video_projects:editor.no_image')}</span>
                    </div>
                )}
            </div>

            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{t('video_projects:editor.scene_label', { index: index + 1 })}</h4>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { onDelete(scene.id); }}
                        className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
                
                <p className="text-sm line-clamp-2">{scene.scriptText || <span className="text-muted-foreground italic">{t('video_projects:editor.no_script')}</span>}</p>
                
                <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>{scene.duration || 0}s</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MusicIcon size={12} />
                        <span>{scene.audioUrl ? t('video_projects:editor.has_audio') : t('video_projects:editor.no_audio')}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
