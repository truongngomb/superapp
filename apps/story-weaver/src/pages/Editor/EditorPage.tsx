import { useParams, useNavigate } from 'react-router-dom';
import { useVideoProject, useRenderVideo } from '@/hooks/useProjects';
import { SceneList } from './components/SceneList';
import { Button, Badge, LoadingSpinner } from '@superapp/ui-kit';
import { ChevronLeft, Rocket, Settings } from 'lucide-react';

export const EditorPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: project, isLoading } = useVideoProject(id!);
    const { mutate: renderVideo, isPending: isRendering } = useRenderVideo();

    if (isLoading) return <div className="p-8 flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
    if (!project) return <div className="p-8 text-center"><h2 className="text-2xl font-bold">Project not found</h2><Button onClick={() => navigate('/dashboard')} className="mt-4">Back to Dashboard</Button></div>;

    const handleRender = () => {
        if (project.id) {
            renderVideo(project.id);
        }
    };

    const canRender = project.status === 'draft' || project.status === 'completed';
    const isCurrentlyRendering = project.status === 'rendering';

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                        <ChevronLeft />
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg">{project.name}</h1>
                        <Badge variant={project.status === 'completed' ? 'success' : project.status === 'rendering' ? 'primary' : 'secondary'} size="sm" className="mt-0.5">
                            {project.status}
                        </Badge>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Settings size={16} className="mr-2" /> Settings
                    </Button>
                    <Button 
                        size="sm" 
                        onClick={handleRender} 
                        disabled={!canRender || isRendering}
                        loading={isRendering || isCurrentlyRendering}
                    >
                        <Rocket size={16} className="mr-2" /> 
                        {isCurrentlyRendering ? 'Rendering...' : 'Generate Video'}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Script & Scenes */}
                <div className="w-1/3 border-r border-border bg-surface p-4 overflow-hidden flex flex-col">
                    <SceneList projectId={project.id} />
                </div>

                {/* Right: Preview & AI Chat */}
                <div className="flex-1 bg-muted/30 p-8 flex flex-col items-center justify-center">
                    <div className="aspect-[9/16] h-[80%] bg-black rounded-xl shadow-2xl flex items-center justify-center text-white/50">
                        Preview Player Placeholder
                    </div>
                </div>
            </div>
        </div>
    );
};
