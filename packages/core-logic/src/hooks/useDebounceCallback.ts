import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook to debounce a callback function
 * @param callback - The function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced version of the callback
 */
export function useDebounceCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Always keep latest callback reference
  callbackRef.current = callback;

  // Cleanup on unmount
  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delay);
    },
    [delay]
  );
}
