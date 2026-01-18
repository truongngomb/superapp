/**
 * Reusable Markdown Editor Component
 * Wrapper for @uiw/react-md-editor with theme support
 */
import MDEditor from '@uiw/react-md-editor';
import type { MDEditorProps } from '@uiw/react-md-editor';

interface MarkdownEditorProps extends Partial<MDEditorProps> {
  value: string;
  onChange: (value?: string) => void;
  height?: number;
  preview?: 'live' | 'edit' | 'preview';
  hideToolbar?: boolean;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  height = 400,
  preview = 'live',
  hideToolbar = false,
  className = '',
  ...props
}: MarkdownEditorProps) {
  // Auto-detect theme from document (set by ThemeProvider)
  const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  
  return (
    <div data-color-mode={theme} className={className}>
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        hideToolbar={hideToolbar}
        {...props}
      />
    </div>
  );
}
