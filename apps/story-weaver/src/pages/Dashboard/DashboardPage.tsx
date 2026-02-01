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
import { VideoProject, VideoProjectListParams, CreateVideoProjectInput, UpdateVideoProjectInput } from '@/types';
import { videoProjectService } from '@/services';
import { CreateProjectModal } from './components/CreateProjectModal';
import { Video, Globe, Monitor } from 'lucide-react';

const getLanguageIcon = (lang?: string) => {
    switch (lang?.toLowerCase()) {
        case 'vi': return <span className="fi fi-vn shadow-sm" />;
        case 'en': return <span className="fi fi-us shadow-sm" />;
        case 'ko': return <span className="fi fi-kr shadow-sm" />;
        default: return <Globe className="h-3.5 w-3.5" />;
    }
};

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
                                <div className="flex flex-col gap-3 mt-4">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5" title={t('video_projects:wizard.story.language_label')}>
                                                {getLanguageIcon(project.scriptLanguage)}
                                                <span>{t(`video_projects:languages.${String(project.scriptLanguage)}`)}</span>
                                            </div>
                                        
                                        {(project.aspectRatio || project.settings?.aspectRatio) && (
                                            <div className="flex items-center gap-1.5" title={t('video_projects:wizard.settings.aspect_label')}>
                                                <Monitor className="h-3.5 w-3.5" />
                                                <span>{project.aspectRatio || project.settings?.aspectRatio}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center text-xs text-muted-foreground pt-3 border-t">
                                        <span>{new Date(project.created).toLocaleDateString()}</span>
                                        <Badge variant={
                                            project.status === 'completed' ? 'success' : 
                                            project.status === 'rendering' ? 'primary' :
                                            'secondary'
                                        } size="sm">
                                            {t(`video_projects:status.${project.status}`)}
                                        </Badge>
                                    </div>
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
