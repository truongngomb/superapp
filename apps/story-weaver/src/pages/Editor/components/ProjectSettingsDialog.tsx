import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    Button,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    useToast
} from '@superapp/ui-kit';
import { VideoProject, UpdateVideoProjectInput, TARGET_PLATFORM, ASPECT_RATIO, PLATFORM_PRESETS, TargetPlatform } from '@/types';
import { videoProjectService } from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import { StoryInputStep } from '@/pages/Dashboard/components/wizard/StoryInputStep';
import { SettingsStep } from '@/pages/Dashboard/components/wizard/SettingsStep';
import type { WizardData } from '@/hooks/useProjectWizard';

interface ProjectSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: VideoProject;
}

export function ProjectSettingsDialog({ open, onOpenChange, project }: ProjectSettingsDialogProps) {
    const { t } = useTranslation(['video_projects', 'uikit']);
    const toast = useToast();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mapped state
    const [data, setData] = useState<WizardData>({
        name: project.name,
        description: project.description || '',
        storyContent: project.storyContent || 'n/a', 
        aspectRatio: project.aspectRatio || ASPECT_RATIO.PORTRAIT_9_16,
        targetPlatform: project.targetPlatform || TARGET_PLATFORM.YOUTUBE_SHORTS,
        targetDuration: project.targetDuration || 60,
        artStyleId: project.artStyleId,
    });

    // We need to sync with project when it opens
    useEffect(() => {
        if (open) {
            setData({
                name: project.name,
                description: project.description || '',
                storyContent: project.storyContent || 'n/a',
                aspectRatio: project.aspectRatio || ASPECT_RATIO.PORTRAIT_9_16,
                targetPlatform: project.targetPlatform || TARGET_PLATFORM.YOUTUBE_SHORTS,
                targetDuration: project.targetDuration || 60,
                artStyleId: project.artStyleId,
            });
        }
    }, [open, project]);

    const updateData = (partial: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...partial }));
    };

    const getPlatformDefaults = useCallback((platform: TargetPlatform) => {
        const preset = PLATFORM_PRESETS[platform];
        return {
          aspectRatio: preset.aspectRatio,
          targetDuration: Math.round((preset.minDuration + preset.maxDuration) / 2),
        };
    }, []);

    const onSubmit = async () => {
        try {
            setIsSubmitting(true);
            const updateInput: UpdateVideoProjectInput = {
                name: data.name,
                description: data.description,
                aspectRatio: data.aspectRatio,
                targetPlatform: data.targetPlatform,
                targetDuration: data.targetDuration,
                artStyleId: data.artStyleId,
                // Note: storyContent is not typically updated here as it drives generation, 
                // but can be added if backend supports it. For now, it's just metadata editing.
            };

            await videoProjectService.update(project.id, updateInput);
            
            toast.success(t('video_projects:settings.update_success'));
            
            // Invalidate queries to refresh data
            await queryClient.invalidateQueries({ queryKey: ['video-projects', project.id] });
            await queryClient.invalidateQueries({ queryKey: ['video_projects'] });
            
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error(t('video_projects:settings.update_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={open}
            onClose={() => { onOpenChange(false); }}
            title={t('video_projects:settings.title')}
            description={t('video_projects:settings.description')}
            size="lg"
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button variant="outline" type="button" onClick={() => { onOpenChange(false); }}>
                        {t('uikit:cancel')}
                    </Button>
                    <Button 
                        onClick={() => { void onSubmit(); }} 
                        loading={isSubmitting}
                    >
                        {t('uikit:save_changes')}
                    </Button>
                </div>
            }
        >
            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">{t('video_projects:settings.tab_general')}</TabsTrigger>
                    <TabsTrigger value="format">{t('video_projects:settings.tab_format')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="mt-4">
                    <StoryInputStep 
                        data={data} 
                        onUpdate={updateData} 
                    />
                </TabsContent>
                
                <TabsContent value="format" className="mt-4">
                    <SettingsStep 
                        data={data} 
                        onUpdate={updateData}
                        getPlatformDefaults={getPlatformDefaults}
                    />
                </TabsContent>
            </Tabs>
        </Modal>
    );
}
