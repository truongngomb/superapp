import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useVideoProject, useVideoRendering } from '@/hooks';
import { useDocumentTitle } from '@superapp/core-logic';
import { SceneList } from './components/SceneList';
import { CharacterStudioPanel } from './components/CharacterStudio';
import { ScriptEditorPanel } from './components/ScriptEditor';
import { Button, Badge, LoadingSpinner, fadeSlideUp, defaultTransition } from '@superapp/ui-kit';
import { ChevronLeft, Rocket, Settings, Users, Film, Palette, FileText, Download, Play } from 'lucide-react';
import { APP_NAME } from '@/config/constants';

type EditorTab = 'scenes' | 'script' | 'characters' | 'visuals';

export const EditorPage = () => {
    const { t } = useTranslation(['video_projects', 'uikit', 'characters']);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: project, isLoading } = useVideoProject(id || '');
    const { renderVideo, isRendering } = useVideoRendering();
    
    const [activeTab, setActiveTab] = useState<EditorTab>('scenes');

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
        { key: 'scenes' as const, label: t('video_projects:editor.tabs.scenes'), icon: Film },
        { key: 'script' as const, label: t('video_projects:editor.tabs.script'), icon: FileText },
        { key: 'characters' as const, label: t('characters:title'), icon: Users },
        { key: 'visuals' as const, label: t('video_projects:editor.tabs.visuals'), icon: Palette },
    ];

    // Script tab uses full width layout (has its own split view)
    const isFullWidthTab = activeTab === 'script';

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => { void navigate('/dashboard'); }}>
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
                    <Button variant="outline" size="sm">
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
                            {t('uikit:download', { defaultValue: 'Download' })}
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
                                        onClick={() => { setActiveTab(tab.key); }}
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
                        <div className="flex-1 overflow-auto p-4">
                            <AnimatePresence mode="wait">
                                {activeTab === 'scenes' && (
                                    <motion.div
                                        key="scenes"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full"
                                    >
                                        <SceneList projectId={project.id} />
                                    </motion.div>
                                )}

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
                                
                                {activeTab === 'visuals' && (
                                    <motion.div
                                        key="visuals"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Palette size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{t('video_projects:editor.visuals_guide_title', { defaultValue: 'Scene Visuals' })}</h3>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                {t('video_projects:editor.visuals_guide_desc', { defaultValue: 'Select a scene from the "Scenes" tab to generate or edit AI images and motion.' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: Preview & AI Chat (hidden for full-width tabs) */}
                    {!isFullWidthTab && (
                        <div className="flex-1 bg-muted/30 p-8 flex flex-col items-center justify-center">
                            <div className="aspect-[9/16] h-[80%] bg-black rounded-xl shadow-2xl flex flex-col items-center justify-center text-white/50 overflow-hidden relative">
                                {project.outputUrl ? (
                                    <video 
                                        src={project.outputUrl} 
                                        controls 
                                        className="w-full h-full object-contain"
                                        autoPlay={false}
                                    />
                                ) : (
                                    <>
                                        <Play size={48} className="mb-4 opacity-20" />
                                        <p className="px-12 text-center text-sm">
                                            {t('video_projects:editor.preview_placeholder')}
                                        </p>
                                        {project.status === 'rendering' && (
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                                                <LoadingSpinner size="lg" className="text-primary mb-4" />
                                                <p className="text-white text-sm font-medium animate-pulse">
                                                    {t('video_projects:editor.rendering')}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
