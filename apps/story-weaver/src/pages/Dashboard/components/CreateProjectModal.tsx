import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateVideoProject, useGenerateVideoScript } from '@/hooks/useProjects';
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
    const [activeTab, setActiveTab] = useState('manual');
    const { mutate: createProject, isPending: isCreating } = useCreateVideoProject();
    const { mutate: generateScript, isPending: isGenerating } = useGenerateVideoScript();
    
    // Manual Form
    const form = useForm<CreateVideoProjectInput>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(createVideoProjectSchema) as any,
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
            onClose={() => onOpenChange(false)} 
            title={activeTab === 'manual' ? "Create New Project" : "Generate with AI"}
            description={activeTab === 'manual' ? "Start weaving your new story manually." : "Let AI write the script and plan scenes for you."}
            size="md"
            footer={
                <div className="flex justify-between w-full items-center">
                    <div className="text-xs text-muted-foreground">
                        {activeTab === 'ai' && "Powered by Google Gemini 1.5 Flash"}
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        {activeTab === 'manual' ? (
                            <Button onClick={form.handleSubmit(onManualSubmit)} loading={isCreating}>Create Project</Button>
                        ) : (
                            <Button onClick={aiForm.handleSubmit(onAiSubmit)} loading={isGenerating} className="gap-2">
                                <Wand2 size={16} /> Generate Idea
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="manual" className="gap-2"><PenTool size={16} /> Manual</TabsTrigger>
                    <TabsTrigger value="ai" className="gap-2"><Wand2 size={16} /> AI Assistant</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onManualSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="My Awesome Video" {...field} value={field.value || ''} />
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
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Short description..." {...field} value={field.value || ''} />
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
                        <form onSubmit={aiForm.handleSubmit(onAiSubmit)} className="space-y-4">
                            <FormField
                                control={aiForm.control}
                                name="topic"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>What is your video about?</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="E.g. A 15-second teaser about correct posture while working remotely..." 
                                                className="min-h-[120px]"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-md border border-blue-100">
                                <p className="font-semibold mb-1"> ✨ What happens next?</p>
                                <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                                    <li>AI will write a script based on your topic.</li>
                                    <li>Scenes will be automatically generated with visual descriptions.</li>
                                    <li>A new draft project will be created for you to edit.</li>
                                </ul>
                            </div>
                        </form>
                    </Form>
                </TabsContent>
            </Tabs>
        </Modal>
    );
};
