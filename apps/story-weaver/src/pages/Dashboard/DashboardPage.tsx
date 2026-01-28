import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { 
    PageHeader, 
    GradientText, 
    EmptyState, 
    Card, 
    CardContent, 
    CardTitle, 
    CardDescription, 
    Badge, 
    fadeSlideUp, 
    defaultTransition 
} from '@superapp/ui-kit';
import { useResource } from '@superapp/core-logic';
import { VideoProject, VideoProjectListParams, CreateVideoProjectInput, UpdateVideoProjectInput } from '@superapp/shared-types';
import { videoProjectService } from '@/services';
import { CreateProjectModal } from './components/CreateProjectModal';
import { Video } from 'lucide-react';

export const DashboardPage = () => {
    const { t } = useTranslation(['video_projects', 'uikit']);
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Use standardized useResource hook (SSoT from Category Management)
    const { 
        items: projects, 
        loading: isLoading 
    } = useResource<VideoProject, CreateVideoProjectInput, UpdateVideoProjectInput, VideoProjectListParams>({
        service: videoProjectService,
        resourceName: 'video_projects',
        initialParams: {
            // Default to generous limit for dashboard grid
            limit: 12,
            sort: 'created',
            order: 'desc'
        }
    });

    return (
        <div className="p-8">
            <PageHeader
                resource="video_projects"
                titleKey="video_projects:dashboard.title"
                subtitleKey="video_projects:dashboard.subtitle"
                onExport={() => {}} 
                showExport={false}
                onCreateClick={() => { setIsCreateModalOpen(true); }}
                createButtonKey="video_projects:dashboard.create_btn"
            >
                <GradientText className="text-sm font-semibold mr-4">
                    {t('video_projects:dashboard.ai_ready')}
                </GradientText>
            </PageHeader>

            <AnimatePresence mode="wait">
            {projects.length === 0 && !isLoading ? (
                <motion.div
                    key="empty"
                    variants={fadeSlideUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={defaultTransition}
                >
                    <EmptyState
                        icon={Video}
                        title={t('video_projects:dashboard.empty.title')}
                        description={t('video_projects:dashboard.empty.description')}
                        actionText={t('video_projects:dashboard.empty.action')}
                        onAction={() => { setIsCreateModalOpen(true); }}
                    />
                </motion.div>
            ) : (
                <motion.div 
                    key="content"
                    variants={fadeSlideUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={defaultTransition}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {projects.map((project) => (
                        <Card 
                            key={project.id} 
                            hoverable
                            onClick={() => { void navigate(`/editor/${project.id}`); }}
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
                                        {t(`video_projects:status.${project.status}`)}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            )}
            </AnimatePresence>


            <CreateProjectModal 
                open={isCreateModalOpen} 
                onOpenChange={setIsCreateModalOpen} 
            />
        </div>
    );
};
