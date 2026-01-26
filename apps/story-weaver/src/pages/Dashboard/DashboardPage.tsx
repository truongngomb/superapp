import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, GradientText, EmptyState, Card, CardContent, CardTitle, CardDescription, Badge, LoadingSpinner } from '@superapp/ui-kit';
import { useVideoProjects } from '@/hooks/useProjects';
import { CreateProjectModal } from './components/CreateProjectModal';
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';

export const DashboardPage = () => {
    const { t } = useTranslation(['video_projects', 'uikit']);
    const { projects, isLoading } = useVideoProjects();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="p-8">
            <PageHeader
                resource="video_projects"
                titleKey="video_projects:dashboard.title"
                subtitleKey="video_projects:dashboard.subtitle"
                onExport={() => {}} 
                showExport={false}
                onCreateClick={() => setIsCreateModalOpen(true)}
                createButtonKey="video_projects:dashboard.create_btn"
            >
                <GradientText className="text-sm font-semibold mr-4">
                    {t('video_projects:dashboard.ai_ready')}
                </GradientText>
            </PageHeader>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" />
                </div>
            ) : projects.length === 0 ? (
                <EmptyState
                    icon={Video}
                    title={t('video_projects:dashboard.empty.title')}
                    description={t('video_projects:dashboard.empty.description')}
                    actionText={t('video_projects:dashboard.empty.action')}
                    onAction={() => setIsCreateModalOpen(true)}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Card 
                            key={project.id} 
                            hoverable
                            onClick={() => navigate(`/editor/${project.id}`)}
                            className="group"
                        >
                            <CardContent className="p-6">
                                <CardTitle className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                                    {project.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {project.description || t('video_projects:dashboard.no_description')}
                                </CardDescription>
                                <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
                                    <span>{new Date(project.created).toLocaleDateString()}</span>
                                    <Badge variant={
                                        project.status === 'completed' ? 'success' : 
                                        project.status === 'rendering' ? 'primary' :
                                        'secondary'
                                    } size="sm">
                                        {t(`uikit:status.${project.status}`, { defaultValue: project.status })}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
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
