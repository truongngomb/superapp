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
    // Support h1-h4 for ToC
    const headingRegex = /^(#{1,4})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];
    
    return matches
      .map((match) => {
        const level = match[1] ? match[1].length : 2;
        const text = match[2] ? match[2].trim() : '';
        if (!text) return null;
        
        // GitHub-style slugger (approximate)
        // Match behavior: 
        // 1. Lowercase
        // 2. Remove standard punctuation including & (github-slugger strips these)
        // 3. Replace spaces with dashes (this preserves double dashes if punctuation was removed between spaces)
        const id = text
          .toLowerCase()
          .trim()
          // Remove punctuation: dot, parens, &, etc. but KEEP dashes and underscores if part of word? 
          // Actually github-slugger removes !"#$%&'()*+,./:;<=>?@[\]^`{|}~
          .replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/g, '') 
          // Replace space with dash
          .replace(/\s/g, '-')
          // Ensure no leading/trailing dashes
          .replace(/^-+|-+$/g, '');
          
        return { id, text, level };
      })
      .filter((item): item is TocItem => item !== null);
  }, [content]);

  const scrollToId = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    
    // Attempt to find element with exact ID or normalized ID (collapse dashes)
    let element = document.getElementById(id);
    
    // Fallback 1: Try collapsing dashes (a--b -> a-b)
    if (!element) {
      element = document.getElementById(id.replace(/-+/g, '-'));
    }
    
    // Fallback 2: Try encoded & (sometimes raw IDs have different encoding?)
    // Actually simpler: try just replacing all non-word chars with single dash
    if (!element) {
       const fallbackId = id.replace(/-+/g, '-');
       element = document.getElementById(fallbackId);
    }
    
    if (element) {
      const offset = 100; // Header offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update URL hash without jumping
      window.history.pushState(null, '', `#${id}`);
      setActiveId(id);
    }
  };
  
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
          <li 
            key={id} 
            className={cn(
              'text-sm transition-all',
              level === 1 && 'font-semibold',
              level === 2 && 'ml-2',
              level === 3 && 'ml-6',
              level === 4 && 'ml-10'
            )}
          >
            <a
              href={`#${id}`}
              onClick={(e) => { scrollToId(e, id); }}
              className={cn(
                'block py-1 hover:text-primary transition-colors border-l-2 pl-4 -ml-4',
                activeId === id 
                  ? 'text-primary font-medium border-primary bg-primary/5' 
                  : 'text-muted border-transparent hover:border-muted/30'
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
