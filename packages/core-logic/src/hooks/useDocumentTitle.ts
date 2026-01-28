import { useRef, useEffect } from 'react'

/**
 * useDocumentTitle Hook
 * 
 * Safely updates the document title.
 * 
 * @param title - The title to set.
 * @param preserveTitleOnUnmount - Whether to restore the previous title on unmount.
 */
export function useDocumentTitle(title: string | null | undefined, preserveTitleOnUnmount: boolean = false) {
  const defaultTitle = useRef(document.title);

  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  useEffect(() => {
    return () => {
      if (preserveTitleOnUnmount) {
        document.title = defaultTitle.current;
      }
    };
  }, [preserveTitleOnUnmount]);
}
