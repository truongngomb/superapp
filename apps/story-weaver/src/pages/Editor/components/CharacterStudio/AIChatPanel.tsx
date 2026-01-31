/**
 * AIChatPanel Component
 * 
 * Chat interface for AI Image Editing.
 * Context-aware: Knows which image is being edited.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@superapp/ui-kit';
import { Send, Sparkles, Image as ImageIcon } from 'lucide-react';

interface AIChatPanelProps {
  contextImageUrl?: string | null;
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
}

export const AIChatPanel = ({
  contextImageUrl,
  onSendMessage,
  isProcessing = false
}: AIChatPanelProps) => {
  const { t } = useTranslation(['characters']);
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
    }
  };

  if (!contextImageUrl) {
      return (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground border-t bg-muted/5">
              <ImageIcon className="mb-2 opacity-50" size={32} />
              <p className="text-sm">{t('characters:chat.select_image_hint')}</p>
          </div>
      )
  }

  return (
    <div className="flex flex-col border-t bg-background h-[280px]">
      {/* Context Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/10 text-xs font-medium text-primary">
        <Sparkles size={12} />
        {t('characters:chat.context_indicator')}
      </div>

      {/* Chat History (Placeholder) */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        <div className="bg-muted/30 p-3 rounded-lg text-sm text-balance text-muted-foreground max-w-[80%] space-y-1">
          <p>{t('characters:chat.welcome_message')}</p>
          <p className="text-xs opacity-70">{t('characters:chat.example_prompts')}</p>
        </div>
        {/* Real chat history would map here */}
      </div>

      {/* Input Area */}
      <div className="p-3 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => { setInput(e.target.value); }}
            placeholder={t('characters:chat.placeholder')}
            disabled={isProcessing}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isProcessing}>
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
};
