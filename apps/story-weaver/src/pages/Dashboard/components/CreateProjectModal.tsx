import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateVideoProject, useGenerateVideoScript } from '@/hooks';
import { 
    Modal,
    Button, Input, Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
    Textarea, Tabs, TabsList, TabsTrigger, TabsContent
} from '@superapp/ui-kit';
import { createVideoProjectSchema, CreateVideoProjectInput } from '@superapp/shared-types';
import { Wand2, PenTool } from 'lucide-react';

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CreateProjectModal = ({ open, onOpenChange }: CreateProjectModalProps) => {
    const { t } = useTranslation(['video_projects', 'uikit']);
    const [activeTab, setActiveTab] = useState('manual');
    const { mutate: createProject, isPending: isCreating } = useCreateVideoProject();
    const { mutate: generateScript, isPending: isGenerating } = useGenerateVideoScript();
    
    // Manual Form
    const form = useForm<CreateVideoProjectInput>({
        resolver: zodResolver(createVideoProjectSchema),
        defaultValues: {
            name: '',
            description: '',
            settings: { aspectRatio: '9:16' }
        }
    });

    // AI Form
    const aiForm = useForm<{ topic: string }>({
        defaultValues: { topic: '' }
    });

    const onManualSubmit = (data: CreateVideoProjectInput) => {
        createProject(data, {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
            }
        });
    };

    const onAiSubmit = (data: { topic: string }) => {
        generateScript(data.topic, {
            onSuccess: () => {
                onOpenChange(false);
                aiForm.reset();
            }
        });
    };

    return (
        <Modal 
            isOpen={open} 
            onClose={() => { onOpenChange(false); }} 
            title={activeTab === 'manual' ? t('video_projects:modal.create.title_manual') : t('video_projects:modal.create.title_ai')}
            description={activeTab === 'manual' ? t('video_projects:modal.create.desc_manual') : t('video_projects:modal.create.desc_ai')}
            size="md"
            footer={
                <div className="flex justify-between w-full items-center">
                    <div className="text-xs text-muted-foreground">
                        {activeTab === 'ai' && t('video_projects:modal.create.ai_power')}
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => { onOpenChange(false); }}>{t('uikit:cancel')}</Button>
                        {activeTab === 'manual' ? (
                            <Button 
                                onClick={() => { void form.handleSubmit(onManualSubmit)(); }} 
                                loading={isCreating}
                            >
                                {t('video_projects:dashboard.create_btn')}
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => { void aiForm.handleSubmit(onAiSubmit)(); }} 
                                loading={isGenerating} 
                                className="gap-2"
                            >
                                <Wand2 size={16} /> {t('video_projects:modal.create.generate_idea')}
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="manual" className="gap-2"><PenTool size={16} /> {t('video_projects:modal.create.manual')}</TabsTrigger>
                    <TabsTrigger value="ai" className="gap-2"><Wand2 size={16} /> {t('video_projects:modal.create.ai_assistant')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual">
                    <Form {...form}>
                        <form onSubmit={(e) => { void form.handleSubmit(onManualSubmit)(e); }} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('video_projects:modal.create.name_label')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('video_projects:modal.create.name_placeholder')} {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('video_projects:modal.create.desc_label')}</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder={t('video_projects:modal.create.desc_placeholder')} {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </TabsContent>

                <TabsContent value="ai">
                    <Form {...aiForm}>
                        <form onSubmit={(e) => { void aiForm.handleSubmit(onAiSubmit)(e); }} className="space-y-4">
                            <FormField
                                control={aiForm.control}
                                name="topic"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t('video_projects:modal.create.ai_topic_label')}</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder={t('video_projects:modal.create.ai_topic_placeholder')} 
                                                className="min-h-[120px]"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-md border border-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900/50">
                                <p className="font-semibold mb-1"> {t('video_projects:modal.create.next_steps.title')}</p>
                                <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                                    <li>{t('video_projects:modal.create.next_steps.step1')}</li>
                                    <li>{t('video_projects:modal.create.next_steps.step2')}</li>
                                    <li>{t('video_projects:modal.create.next_steps.step3')}</li>
                                </ul>
                            </div>
                        </form>
                    </Form>
                </TabsContent>
            </Tabs>
        </Modal>
    );
};
