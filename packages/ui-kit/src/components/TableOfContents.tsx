/**
 * Auto-generated Table of Contents from Markdown headings
 * With scroll tracking and active section highlighting
 */
import { useEffect, useState, useMemo } from 'react';
import { cn } from '@superapp/core-logic';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  
  // Extract headings using useMemo instead of useEffect
  const items = useMemo(() => {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];
    
    return matches
      .map((match) => {
        const level = match[1] ? match[1].length : 2;
        const text = match[2] ? match[2].trim() : '';
        if (!text) return null;
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return { id, text, level };
      })
      .filter((item): item is TocItem => item !== null);
  }, [content]);
  
  useEffect(() => {
    // Track scroll position with IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );
    
    items.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });
    
    return () => { observer.disconnect(); };
  }, [items]);
  
  if (items.length === 0) return null;
  
  return (
    <nav className={cn('space-y-2', className)}>
      <h3 className="font-semibold mb-3">Table of Contents</h3>
      <ul className="space-y-1">
        {items.map(({ id, text, level }) => (
          <li key={id} className={cn('text-sm', level === 3 && 'ml-4')}>
            <a
              href={`#${id}`}
              className={cn(
                'block py-1 hover:text-primary transition-colors',
                activeId === id ? 'text-primary font-medium' : 'text-muted'
              )}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
