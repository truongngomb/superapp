import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { useVideoProject, useVideoRendering, useVideoScenes } from '@/hooks';
import { cn, useDocumentTitle } from '@superapp/core-logic';

import { CharacterStudioPanel } from './components/CharacterStudio';
import { ScriptEditorPanel } from './components/ScriptEditor';
import { ProjectSettingsDialog } from './components/ProjectSettingsDialog';
import { PreviewPlayer } from './components/PreviewPlayer';
import { PreviewProvider, usePreviewContext } from './context';
import { Button, Badge, fadeSlideUp, defaultTransition } from '@superapp/ui-kit';
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

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] min-h-[500px] flex flex-col overflow-hidden rounded-xl bg-card shadow-sm border border-border/100">
        {/* Header Skeleton */}
        <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 gap-4">
             {/* Left: Project Info */}
             <div className="flex items-center gap-3 w-[250px]">
                 <div className="w-8 h-8 rounded bg-muted animate-pulse" />
                 <div className="flex items-center gap-2">
                     <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                     <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                 </div>
             </div>
             
             {/* Center: Tabs Placeholder */}
             <div className="flex-1 flex justify-center h-full items-center gap-6 opacity-50">
                 <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                 <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                 <div className="h-4 w-24 bg-muted animate-pulse rounded" />
             </div>

             {/* Right: Actions */}
             <div className="flex items-center gap-2 w-[250px] justify-end">
                 <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                 <div className="h-8 w-32 bg-muted animate-pulse rounded" />
             </div>
        </div>
      </div>
    );
  }

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

    return (
        <div className="h-[calc(100vh-120px)] min-h-[500px] flex flex-col overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm border border-border/100">
            {/* Compact Header with Tabs */}
            <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0 z-20 relative gap-4">
                {/* Left: Project Info */}
                <div className="flex items-center gap-3 w-[250px]">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -ml-1" onClick={() => { void navigate('/dashboard'); }}>
                        <ChevronLeft size={18} />
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                             <h1 className="font-semibold text-sm truncate max-w-[150px]" title={project.name}>
                                {project.name}
                            </h1>
                            <Badge variant={project.status === 'completed' ? 'success' : project.status === 'rendering' ? 'primary' : 'secondary'} className="text-[10px] h-4 px-1 pb-0">
                                {t(`video_projects:status.${project.status}`)}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Center: Tabs */}
                <div className="flex-1 flex justify-center h-full">
                    <div className="flex h-full">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => { 
                                        void navigate(`#${tab.key}`);
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 px-6 text-sm font-medium transition-colors relative h-full border-b-2",
                                         isActive 
                                            ? 'border-primary text-primary' 
                                            : 'border-transparent text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <Icon size={16} />
                                    <span className="hidden lg:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 w-[250px] justify-end">
                    <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={() => { setIsSettingsOpen(true); }}>
                        <Settings size={16} />
                        <span className="hidden sm:inline">{t('uikit:settings')}</span>
                    </Button>
                    
                    {project.status === 'completed' && project.outputUrl && (
                        <Button 
                             variant="secondary" 
                             size="sm"
                             className="h-8 gap-2"
                             onClick={() => {
                                 if (project.outputUrl) window.open(project.outputUrl, '_blank');
                             }}
                        >
                            <Download size={16} />
                        </Button>
                    )}

                    <Button 
                        size="sm" 
                        className="h-8 gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
                        onClick={handleRender} 
                        disabled={!canRender || isRendering}
                        loading={isRendering || isCurrentlyRendering}
                    >
                        <Rocket size={16} />
                        <span className="hidden lg:inline">
                             {isCurrentlyRendering ? t('video_projects:editor.rendering') : t('video_projects:editor.generate_video')}
                        </span>
                    </Button>
                </div>
            </div>

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
                    <div className="flex-1 bg-surface flex flex-col overflow-hidden">

                        {/* Tab Content */}
                        <div className="flex-1 p-4 overflow-hidden bg-background">
                            <AnimatePresence mode="wait">
                                {activeTab === 'script' && (
                                    <motion.div
                                        key="script"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full overflow-hidden bg-background rounded-lg border shadow-sm"
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
                                        <div className="flex h-full overflow-hidden bg-background rounded-lg border shadow-sm">
                                            <div className="w-1/4 border-r border-border overflow-hidden">
                                                <StoryboardPanel projectId={project.id} />
                                            </div>
                                            <div className="flex-1 bg-background overflow-hidden">
                                                <PreviewPlayer project={project} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
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
