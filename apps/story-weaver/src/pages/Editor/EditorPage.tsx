import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useVideoProject, useVideoRendering, useVideoScenes } from '@/hooks';
import { useDocumentTitle } from '@superapp/core-logic';

import { CharacterStudioPanel } from './components/CharacterStudio';
import { ScriptEditorPanel } from './components/ScriptEditor';
import { ProjectSettingsDialog } from './components/ProjectSettingsDialog';
import { PreviewPlayer } from './components/PreviewPlayer';
import { PreviewProvider, usePreviewContext } from './context';
import { Button, Badge, LoadingSpinner, fadeSlideUp, defaultTransition } from '@superapp/ui-kit';
import { ChevronLeft, Rocket, Settings, Users, FileText, Download, Clapperboard } from 'lucide-react';
import { StoryboardPanel } from './components/Storyboard/StoryboardPanel';
import { APP_NAME } from '@/config/constants';

type EditorTab = 'script' | 'characters' | 'storyboard';

// Inner component that uses PreviewContext
const EditorPageContent = () => {
    const { t } = useTranslation(['video_projects', 'uikit', 'characters']);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: project, isLoading } = useVideoProject(id || '');
    const { renderVideo, isRendering } = useVideoRendering();
    const { scenes } = useVideoScenes(id || '');
    const { setScenes } = usePreviewContext();
    
    const hashTab = location.hash.replace('#', '') as EditorTab;
    const activeTab = ['script', 'characters', 'storyboard'].includes(hashTab) ? hashTab : 'script';
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Sync scenes with PreviewContext
    useEffect(() => {
        if (scenes.length > 0) {
            setScenes(scenes);
        }
    }, [scenes, setScenes]);

    useDocumentTitle(project?.name ? `${project.name} | ${APP_NAME}` : APP_NAME);

    if (isLoading) return <div className="p-8 flex items-center justify-center h-screen"><LoadingSpinner size="lg" /></div>;
    if (!project) return (
        <div className="p-8 text-center">
            <h2 className="text-2xl font-bold">{t('video_projects:editor.project_not_found')}</h2>
            <Button onClick={() => { void navigate('/dashboard'); }} className="mt-4">
                {t('video_projects:editor.back_to_dashboard')}
            </Button>
        </div>
    );

    const handleRender = () => {
        if (project.id) {
            renderVideo({ projectId: project.id });
        }
    };

    const canRender = project.status === 'draft' || project.status === 'completed';
    const isCurrentlyRendering = project.status === 'rendering';

    const tabs = [
        { key: 'script' as const, label: t('video_projects:editor.tabs.script'), icon: FileText },
        { key: 'characters' as const, label: t('characters:title'), icon: Users },
        { key: 'storyboard' as const, label: t('video_projects:editor.tabs.storyboard'), icon: Clapperboard },
    ];

    // Script and Characters tabs use full width layout (has their own split view)
    const isFullWidthTab = activeTab === 'script' || activeTab === 'characters';

    return (
        <div className="h-screen flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm border border-border/100">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => { void navigate('/dashboard'); }}>
                        <ChevronLeft />
                    </Button>
                    <div>
                        <h1 className="font-bold text-lg">{project.name}</h1>
                        <Badge variant={project.status === 'completed' ? 'success' : project.status === 'rendering' ? 'primary' : 'secondary'} size="sm" className="mt-0.5">
                            {t(`video_projects:status.${project.status}`)}
                        </Badge>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setIsSettingsOpen(true); }}>
                        <Settings size={16} className="mr-2" /> {t('uikit:settings')}
                    </Button>
                    
                    {project.status === 'completed' && project.outputUrl && (
                        <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                                if (project.outputUrl) {
                                    window.open(project.outputUrl, '_blank');
                                }
                            }}
                        >
                            <Download size={16} className="mr-2" />
                            {t('uikit:download')}
                        </Button>
                    )}

                    <Button 
                        size="sm" 
                        onClick={handleRender} 
                        disabled={!canRender || isRendering}
                        loading={isRendering || isCurrentlyRendering}
                    >
                        <Rocket size={16} className="mr-2" /> 
                        {isCurrentlyRendering ? t('video_projects:editor.rendering') : t('video_projects:editor.generate_video')}
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={project.id}
                    variants={fadeSlideUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={defaultTransition}
                    className="flex flex-1 overflow-hidden"
                >
                    {/* Left Panel with Tabs (or Full Width for Script) */}
                    <div className={`${isFullWidthTab ? 'flex-1' : 'w-1/3'} border-r border-border bg-surface flex flex-col overflow-hidden`}>
                        {/* Tab Navigation */}
                        <div className="flex border-b border-border shrink-0">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => { 
                                            void navigate(`#${tab.key}`);
                                        }}
                                        className={`
                                            flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium
                                            transition-colors border-b-2
                                            ${isActive 
                                                ? 'border-primary text-primary' 
                                                : 'border-transparent text-muted-foreground hover:text-foreground'}
                                        `}
                                    >
                                        <Icon size={16} />
                                        <span className="hidden lg:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 p-4 overflow-hidden bg-background">
                            <AnimatePresence mode="wait">
                                {activeTab === 'script' && (
                                    <motion.div
                                        key="script"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full"
                                    >
                                        <ScriptEditorPanel project={project} />
                                    </motion.div>
                                )}
                                
                                {activeTab === 'characters' && (
                                    <motion.div
                                        key="characters"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full"
                                    >
                                        <CharacterStudioPanel projectId={project.id} />
                                    </motion.div>
                                )}

                                {activeTab === 'storyboard' && (
                                    <motion.div
                                        key="storyboard"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full"
                                    >
                                        <StoryboardPanel projectId={project.id} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Preview Player (hidden for full-width tabs) */}
                    {!isFullWidthTab && (
                        <div className="flex-1 bg-background">
                            <PreviewPlayer project={project} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            
            <ProjectSettingsDialog 
                open={isSettingsOpen} 
                onOpenChange={setIsSettingsOpen} 
                project={project} 
            />
        </div>
    );
};

// Main export with PreviewProvider wrapper
export const EditorPage = () => {
    return (
        <PreviewProvider>
            <EditorPageContent />
        </PreviewProvider>
    );
};
