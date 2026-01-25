/**
 * Reusable Markdown Editor Component
 * Wrapper for @uiw/react-md-editor with theme support
 */
import React, { useRef, useState, useMemo, useCallback } from 'react';
import MDEditor, { commands, type ICommand } from '@uiw/react-md-editor';
import type { MDEditorProps } from '@uiw/react-md-editor';
import { Image as ImageIcon, Images, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MarkdownEditorProps extends Partial<MDEditorProps> {
  value: string;
  onChange: (value?: string) => void;
  height?: number;
  preview?: 'live' | 'edit' | 'preview';
  hideToolbar?: boolean;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
  onGalleryClick?: () => Promise<string | undefined>;
}

export function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
  onGalleryClick,
  height = 400,
  preview = 'live',
  hideToolbar = false,
  className = '',
  ...props
}: MarkdownEditorProps) {
  const { t } = useTranslation(['uikit']);
  
  // Auto-detect theme from document (set by ThemeProvider)
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cursorPos, setCursorPos] = useState<{ start: number, end: number } | null>(null);

  // Helper to insert markdown at cursor or end
  const insertMarkdown = useCallback((markdown: string, selection?: { start: number, end: number }) => {
    const start = selection?.start ?? value.length;
    const end = selection?.end ?? value.length;
    const newValue = value.substring(0, start) + markdown + value.substring(end);
    onChange(newValue);
  }, [value, onChange]);

  // Helper to override command titles with i18n
  const overrideCommandTitles = useCallback((cmds: ICommand[]) => {
    return cmds.map(cmd => {
      const titleMap: Record<string, string> = {
        'bold': t('markdown.bold'),
        'italic': t('markdown.italic'),
        'strikethrough': t('markdown.strikethrough'),
        'hr': t('markdown.hr'),
        'title': t('markdown.title'),
        'title1': t('markdown.heading') + ' 1',
        'title2': t('markdown.heading') + ' 2',
        'title3': t('markdown.heading') + ' 3',
        'title4': t('markdown.heading') + ' 4',
        'title5': t('markdown.heading') + ' 5',
        'title6': t('markdown.heading') + ' 6',
        'link': t('markdown.link'),
        'quote': t('markdown.quote'),
        'code': t('markdown.code'),
        'codeBlock': t('markdown.code_block'),
        'comment': t('markdown.comment'),
        // List commands - try all possible naming variants
        'unorderedListCommand': t('markdown.unordered_list'),
        'orderedListCommand': t('markdown.ordered_list'),
        'checkedListCommand': t('markdown.task_list'),
        'unorderedList': t('markdown.unordered_list'),
        'orderedList': t('markdown.ordered_list'),
        'checkedList': t('markdown.task_list'),
        // Hyphenated names (actual command names from library)
        'unordered-list': t('markdown.unordered_list'),
        'ordered-list': t('markdown.ordered_list'),
        'checked-list': t('markdown.task_list'),
        'uol': t('markdown.unordered_list'),
        'ol': t('markdown.ordered_list'),
        'ul': t('markdown.unordered_list'),
        'olist': t('markdown.ordered_list'),
        'ulist': t('markdown.unordered_list'),
        'list': t('markdown.unordered_list'),
        'table': t('markdown.table'),
        // Editor view modes
        'edit': t('markdown.edit_mode'),
        'live': t('markdown.live_mode'),
        'preview': t('markdown.preview_mode'),
        'fullscreen': t('markdown.fullscreen'),
      };

      if (cmd.name && titleMap[cmd.name]) {
        return {
          ...cmd,
          buttonProps: {
            ...cmd.buttonProps,
            'aria-label': titleMap[cmd.name],
            title: titleMap[cmd.name],
          }
        };
      }
      return cmd;
    });
  }, [t]);

  // Custom Image Upload Command
  const imageUploadCommand: ICommand = useMemo(() => ({
    name: 'image',
    keyCommand: 'image',
    buttonProps: { 
      'aria-label': t('markdown.insert_image'), 
      title: t('markdown.insert_image') 
    },
    icon: (
      <span style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
        <ImageIcon className="w-3 h-3" />
      </span>
    ),
    execute: (state, _api) => {
      // Save current selection to restore after file pick
      setCursorPos({ start: state.selection.start, end: state.selection.end });
      fileInputRef.current?.click();
    },
  }), [t]);

  // Custom Gallery Command
  const galleryCommand: ICommand = useMemo(() => ({
    name: 'gallery',
    keyCommand: 'gallery',
    buttonProps: { 
      'aria-label': t('markdown.media_library'), 
      title: t('markdown.media_library') 
    },
    icon: (
      <span style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
        <Images className="w-3 h-3" />
      </span>
    ),
    execute: async (state, _api) => {
       if (!onGalleryClick) return;
       // Save current selection 
       const selection = { start: state.selection.start, end: state.selection.end };
       try {
         const url = await onGalleryClick();
         if (url) {
           const imageMarkdown = `![Image](${url})`;
           insertMarkdown(imageMarkdown, selection);
         }
       } catch (e) {
         console.error(e);
       }
    },
  }), [onGalleryClick, insertMarkdown, t]);

  // Helper to extract YouTube video ID from URL
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
      /youtube\.com\/embed\/([^&\s]+)/,
      /youtube\.com\/v\/([^&\s]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  };

  // Custom YouTube Command
  const youtubeCommand: ICommand = useMemo(() => ({
    name: 'youtube',
    keyCommand: 'youtube',
    buttonProps: { 
      'aria-label': t('markdown.insert_youtube'), 
      title: t('markdown.insert_youtube') 
    },
    icon: (
      <span style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
        <Video className="w-3 h-3" />
      </span>
    ),
    execute: (state, _api) => {
      const selection = { start: state.selection.start, end: state.selection.end };
      const url = prompt(t('markdown.youtube_url_prompt'));
      
      if (url) {
        const videoId = extractYouTubeId(url);
        if (videoId) {
          // Insert iframe embed code
          const embedCode = `
<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
`;
          insertMarkdown(embedCode, selection);
        } else {
          alert(t('markdown.invalid_youtube_url'));
        }
      }
    },
  }), [t, insertMarkdown]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    try {
      const url = await onImageUpload(file);
      const imageMarkdown = `![${file.name}](${url})`;
      
      const start = cursorPos?.start ?? value.length;
      const end = cursorPos?.end ?? value.length;

      const newValue = value.substring(0, start) + imageMarkdown + value.substring(end);
      onChange(newValue);
    } catch (error) {
      console.error("Image upload failed", error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (!onImageUpload) return;
    
    // Check if there are items in the clipboard
    const items = event.clipboardData.items;
    
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault();
        
        const file = item.getAsFile();
        if (!file) continue;

        try {
          const url = await onImageUpload(file);
          const imageMarkdown = `![${file.name}](${url})`;
          
          // Try to find cursor position from the event target (textarea)
          let start = value.length;
          let end = value.length;

          if (event.target instanceof HTMLTextAreaElement) {
             start = event.target.selectionStart;
             end = event.target.selectionEnd;
          }

          const newValue = value.substring(0, start) + imageMarkdown + value.substring(end);
          onChange(newValue);
          
        } catch (error) {
          console.error("Image upload failed", error);
        }
      }
    }
  };
  
  return (
    <div data-color-mode={theme} className={className} onPaste={(e) => void handlePaste(e)}>
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        hideToolbar={hideToolbar}
        commands={
             [
                ...overrideCommandTitles(
                  commands.getCommands()
                    .filter(cmd => cmd.name !== 'help' && cmd.name !== 'image') // Remove default image and help
                ),
                ...(onImageUpload ? [imageUploadCommand] : []), // Add custom image upload
                ...(onGalleryClick ? [galleryCommand] : []), // Add gallery next to image
                youtubeCommand, // Add YouTube video embed
             ]
           }
        {...props}
        extraCommands={overrideCommandTitles(
          commands.getExtraCommands().filter((cmd) => cmd.name !== 'help' && cmd.keyCommand !== 'help')
        )}
      />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={(e) => void handleFileChange(e)} 
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
}
