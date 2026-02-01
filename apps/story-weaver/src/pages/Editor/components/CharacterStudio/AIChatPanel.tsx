/**
 * AIChatPanel Component - Split into History and Input
 * 
 * Refactored to allow flexible layout placement (scrolling history vs fixed input).
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@superapp/ui-kit';
import { Send, Sparkles, Image as ImageIcon } from 'lucide-react';

interface AIChatHistoryProps {
  contextImageUrl?: string | null;
}

export const AIChatHistory = ({ contextImageUrl }: AIChatHistoryProps) => {
    const { t } = useTranslation(['characters']);

    if (!contextImageUrl) {
        return (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground border-t bg-muted/5 mt-4 rounded-lg border-dashed border">
                <ImageIcon className="mb-2 opacity-50" size={32} />
                <p className="text-sm">{t('characters:chat.select_image_hint')}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col mt-4">
            {/* Context Header - Shows which image is being edited */}
            <div className="flex items-center gap-2 px-4 py-2 border rounded-t-lg bg-muted/10 text-xs font-medium text-primary">
                <Sparkles size={12} />
                {t('characters:chat.context_indicator')}
            </div>

            {/* Chat History (Placeholder) */}
            <div className="p-4 border-x border-b rounded-b-lg bg-background min-h-[100px] space-y-4">
                <div className="bg-muted/30 p-3 rounded-lg text-sm text-balance text-muted-foreground max-w-[90%] space-y-1">
                    <p>{t('characters:chat.welcome_message')}</p>
                    <p className="text-xs opacity-70">{t('characters:chat.example_prompts')}</p>
                </div>
                {/* Real chat history would map here */}
            </div>
        </div>
    );
};

interface AIChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export const AIChatInput = ({ 
    onSendMessage, 
    isProcessing = false,
    disabled = false
}: AIChatInputProps) => {
    const { t } = useTranslation(['characters']);
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isProcessing && !disabled) {
            onSendMessage(input);
            setInput('');
        }
    };

    if (disabled) return null;

    return (
        <div className="p-4 border-t bg-background">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input 
                    value={input}
                    onChange={(e) => { setInput(e.target.value); }}
                    placeholder={t('characters:chat.placeholder')}
                    disabled={isProcessing || disabled}
                    className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!input.trim() || isProcessing || disabled}>
                    <Send size={16} />
                </Button>
            </form>
        </div>
    );
};
