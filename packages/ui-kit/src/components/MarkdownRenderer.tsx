/**
 * Reusable Markdown Renderer Component
 * With syntax highlighting and theme support
 */
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  components?: Record<string, React.ComponentType<unknown>>;
}

export function MarkdownRenderer({ 
  content, 
  className = 'prose dark:prose-invert max-w-none',
  components 
}: MarkdownRendererProps) {
  // Auto-detect theme and apply highlight.js theme
  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    
    if (isDark) {
      root.classList.add('hljs-dark');
      root.classList.remove('hljs-light');
    } else {
      root.classList.add('hljs-light');
      root.classList.remove('hljs-dark');
    }
  }, []);
  
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
        components={{
          a: ({ ...props }) => (
            <a {...props} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" />
          ),
          img: ({ ...props }) => (
            <img {...props} className="rounded-lg shadow-md" loading="lazy" />
          ),
          blockquote: ({ ...props }) => (
            <blockquote {...props} className="border-l-4 border-primary pl-4 italic" />
          ),
          code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-surface-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          ...components,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
