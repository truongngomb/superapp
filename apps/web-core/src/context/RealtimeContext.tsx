import React, { createContext, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { logger } from '@/utils';

import { useAuth } from '@/hooks';

interface RealtimeContextType {
  isConnected: boolean;
  subscribe: (event: string, callback: (data: unknown) => void) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = React.useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const subscribersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());

   const handleEvent = useCallback((event: string, e: MessageEvent) => {
    try {
       const data = JSON.parse(e.data as string) as unknown;
       subscribersRef.current.get(event)?.forEach(cb => { cb(data); });
    } catch (err) {
       logger.error('RealtimeContext', `Parse error for ${event}`, err);
    }
 }, []);

  // Connect to SSE
  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        // Deferred to avoid cascading render warning
        setTimeout(() => { setIsConnected(false); }, 0);
      }
      return;
    }

    let isActive = true;

    const connect = () => {
      // Prevent multiple connections
      if (eventSourceRef.current?.readyState === EventSource.OPEN) return eventSourceRef.current;
      
      const es = new EventSource('/api/realtime/events', { withCredentials: true });
      eventSourceRef.current = es;

      es.onopen = () => {
        logger.info('RealtimeContext', 'SSE connected');
        setIsConnected(true);
      };

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data as string) as Record<string, unknown>;
          if (data['type'] === 'connected') {
            // Heartbeat/Welcome
            return;
          }
        } catch {
          // ignore parsing error for heartbeat string
        }
      };

      // Re-attach all existing subscriptions
      subscribersRef.current.forEach((_, event) => {
        es.addEventListener(event, (e) => { handleEvent(event, e); });
      });

      es.onerror = (err) => {
        logger.error('RealtimeContext', 'SSE connection error', err);
        es.close();
        setIsConnected(false);
        eventSourceRef.current = null;
        
        // Retry connection after delay ONLY if this effect is still active
        if (isActive) {
          setTimeout(connect, 5000);
        }
      };

      return es;
    };

    const es = connect();

    return () => {
      isActive = false;
      es.close();
    };
  }, [handleEvent, isAuthenticated]);

  // Optimized subscribe that triggers listener attachment if connected
  const subscribe = useCallback((event: string, callback: (data: unknown) => void) => {
    if (!subscribersRef.current.has(event)) {
      subscribersRef.current.set(event, new Set());
      // If we have an active connection, attach the DOM listener now
      if (eventSourceRef.current && eventSourceRef.current.readyState === EventSource.OPEN) {
         eventSourceRef.current.addEventListener(event, (e) => { handleEvent(event, e); });
      }
    }
    
    const handlers = subscribersRef.current.get(event);
    if (handlers) {
      handlers.add(callback);
    }

    return () => {
        const subs = subscribersRef.current.get(event);
        if (subs) {
            subs.delete(callback);
            if (subs.size === 0) {
              // We intentionally don't remove the DOM listener to avoid race conditions
              // and complexity. An extra listener doing nothing is harmless.
              subscribersRef.current.delete(event);
            }
        }
    };
  }, [handleEvent]);

  const value = useMemo(() => ({ isConnected, subscribe }), [isConnected, subscribe]);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within RealtimeProvider');
  return context;
};
