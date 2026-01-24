import { useState } from 'react';
import { Button } from '@superapp/ui-kit';
import { useVideoProjects } from '@/hooks/useProjects';
import { CreateProjectModal } from './components/CreateProjectModal';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
    const { projects, isLoading } = useVideoProjects();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    My Projects
                </h1>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                    + Create Project
                </Button>
            </div>

            {isLoading ? (
                <div>Loading...</div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
                    <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">Start by creating your first video project.</p>
                    <Button onClick={() => setIsCreateModalOpen(true)}>Create Project</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div 
                            key={project.id} 
                            className="bg-card hover:shadow-lg border border-border rounded-xl p-6 transition-all cursor-pointer group"
                            onClick={() => navigate(`/editor/${project.id}`)}
                        >
                            <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{project.description || 'No description'}</p>
                            <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
                                <span>{new Date(project.created).toLocaleDateString()}</span>
                                <span className={`px-2 py-0.5 rounded-full ${
                                    project.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                    project.status === 'rendering' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                }`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateProjectModal 
                open={isCreateModalOpen} 
                onOpenChange={setIsCreateModalOpen} 
            />
        </div>
    );
};
