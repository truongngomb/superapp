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
          h1: ({ ...props }) => <h1 {...props} className="scroll-mt-24" />,
          h2: ({ ...props }) => <h2 {...props} className="scroll-mt-24" />,
          h3: ({ ...props }) => <h3 {...props} className="scroll-mt-24" />,
          h4: ({ ...props }) => <h4 {...props} className="scroll-mt-24" />,
          table: ({ ...props }) => (
            <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
              <table {...props} className="w-full text-sm m-0" />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead {...props} className="bg-muted/50" />
          ),
          th: ({ ...props }) => (
            <th {...props} className="px-4 py-3 font-semibold text-left border-b" />
          ),
          td: ({ ...props }) => (
            <td {...props} className="px-4 py-3 border-b border-border/50" />
          ),
          a: ({ ...props }) => (
            <a {...props} className="text-primary hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" />
          ),
          img: ({ ...props }) => (
            <div className="my-8 flex flex-col items-center">
              <img {...props} className="rounded-xl shadow-lg border border-border/50 max-h-[500px] w-auto" loading="lazy" />
              {props.alt && <span className="mt-3 text-sm text-muted italic">{props.alt}</span>}
            </div>
          ),
          blockquote: ({ ...props }) => (
            <blockquote {...props} className="border-l-4 border-primary bg-primary/5 py-4 pl-6 pr-4 italic rounded-r-lg my-6" />
          ),
          code: ({ className, children, ...props }: { className?: string; children?: React.ReactNode }) => {
            const isInline = !className || !className.includes('hljs');
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary-600 dark:text-primary-400" {...props}>
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
