import { useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { Toast } from '@/components/common/Toast';
import { ToastContext, type ToastType, type ToastOptions } from './useToast';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const show = useCallback((message: string, type?: ToastType, duration?: number) => {
    setToast({ 
      message, 
      type: type || 'info', 
      duration: duration || 1500 
    });
  }, []);

  const success = useCallback((message: string, duration?: number) => { show(message, 'success', duration); }, [show]);
  const error = useCallback((message: string, duration?: number) => { show(message, 'error', duration); }, [show]);
  const warning = useCallback((message: string, duration?: number) => { show(message, 'warning', duration); }, [show]);
  const info = useCallback((message: string, duration?: number) => { show(message, 'info', duration); }, [show]);
  
  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  // Auto-dismiss logic
  useEffect(() => {
    if (toast && toast.duration !== 0) {
      const timer = setTimeout(() => {
        setToast(null);
      }, toast.duration ?? 1500);
      return () => { clearTimeout(timer); };
    }
  }, [toast]);

  const contextValue = useMemo(() => ({
    show,
    success,
    error,
    warning,
    info,
    dismiss
  }), [show, success, error, warning, info, dismiss]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toast 
        message={toast?.message ?? ''}
        type={toast?.type}
        visible={!!toast}
        onClose={dismiss}
      />
    </ToastContext.Provider>
  );
}
