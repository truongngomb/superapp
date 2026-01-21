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
  const { t } = useTranslation(['common']);
  
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
        'bold': t('markdown.bold', { defaultValue: 'Bold' }),
        'italic': t('markdown.italic', { defaultValue: 'Italic' }),
        'strikethrough': t('markdown.strikethrough', { defaultValue: 'Strikethrough' }),
        'hr': t('markdown.hr', { defaultValue: 'Horizontal Rule' }),
        'title': t('markdown.title', { defaultValue: 'Title' }),
        'title1': t('markdown.heading', { defaultValue: 'Heading' }) + ' 1',
        'title2': t('markdown.heading', { defaultValue: 'Heading' }) + ' 2',
        'title3': t('markdown.heading', { defaultValue: 'Heading' }) + ' 3',
        'title4': t('markdown.heading', { defaultValue: 'Heading' }) + ' 4',
        'title5': t('markdown.heading', { defaultValue: 'Heading' }) + ' 5',
        'title6': t('markdown.heading', { defaultValue: 'Heading' }) + ' 6',
        'link': t('markdown.link', { defaultValue: 'Link' }),
        'quote': t('markdown.quote', { defaultValue: 'Quote' }),
        'code': t('markdown.code', { defaultValue: 'Code' }),
        'codeBlock': t('markdown.code_block', { defaultValue: 'Code Block' }),
        'comment': t('markdown.comment', { defaultValue: 'Insert Comment' }),
        // List commands - try all possible naming variants
        'unorderedListCommand': t('markdown.unordered_list', { defaultValue: 'Unordered List' }),
        'orderedListCommand': t('markdown.ordered_list', { defaultValue: 'Ordered List' }),
        'checkedListCommand': t('markdown.task_list', { defaultValue: 'Task List' }),
        'unorderedList': t('markdown.unordered_list', { defaultValue: 'Unordered List' }),
        'orderedList': t('markdown.ordered_list', { defaultValue: 'Ordered List' }),
        'checkedList': t('markdown.task_list', { defaultValue: 'Task List' }),
        // Hyphenated names (actual command names from library)
        'unordered-list': t('markdown.unordered_list', { defaultValue: 'Unordered List' }),
        'ordered-list': t('markdown.ordered_list', { defaultValue: 'Ordered List' }),
        'checked-list': t('markdown.task_list', { defaultValue: 'Task List' }),
        'uol': t('markdown.unordered_list', { defaultValue: 'Unordered List' }),
        'ol': t('markdown.ordered_list', { defaultValue: 'Ordered List' }),
        'ul': t('markdown.unordered_list', { defaultValue: 'Unordered List' }),
        'olist': t('markdown.ordered_list', { defaultValue: 'Ordered List' }),
        'ulist': t('markdown.unordered_list', { defaultValue: 'Unordered List' }),
        'list': t('markdown.unordered_list', { defaultValue: 'List' }),
        'table': t('markdown.table', { defaultValue: 'Table' }),
        // Editor view modes
        'edit': t('markdown.edit_mode', { defaultValue: 'Edit' }),
        'live': t('markdown.live_mode', { defaultValue: 'Live Preview' }),
        'preview': t('markdown.preview_mode', { defaultValue: 'Preview' }),
        'fullscreen': t('markdown.fullscreen', { defaultValue: 'Fullscreen' }),
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
      'aria-label': t('markdown.insert_image', { defaultValue: 'Insert Image' }), 
      title: t('markdown.insert_image', { defaultValue: 'Insert Image' }) 
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
      'aria-label': t('markdown.media_library', { defaultValue: 'Media Library' }), 
      title: t('markdown.media_library', { defaultValue: 'Media Library' }) 
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
      'aria-label': t('markdown.insert_youtube', { defaultValue: 'Insert YouTube Video' }), 
      title: t('markdown.insert_youtube', { defaultValue: 'Insert YouTube Video' }) 
    },
    icon: (
      <span style={{ fontSize: 12, display: 'flex', alignItems: 'center' }}>
        <Video className="w-3 h-3" />
      </span>
    ),
    execute: (state, _api) => {
      const selection = { start: state.selection.start, end: state.selection.end };
      const url = prompt(t('markdown.youtube_url_prompt', { defaultValue: 'Enter YouTube URL:' }));
      
      if (url) {
        const videoId = extractYouTubeId(url);
        if (videoId) {
          // Insert iframe embed code
          const embedCode = `
<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
`;
          insertMarkdown(embedCode, selection);
        } else {
          alert(t('markdown.invalid_youtube_url', { defaultValue: 'Invalid YouTube URL' }));
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
