/**
 * AppProviders Component
 * Wraps the application with all context providers
 * 
 * This eliminates the "pyramid of doom" nesting in App.tsx
 */
import { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/config/queryClient';
import {
  AuthProvider,
  ThemeProvider,
  ToastProvider,
  RealtimeProvider,
  SettingsProvider,
} from '@/context';
import { ActivityLogProvider } from '@/context/ActivityLogContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Compose multiple providers without deep nesting
 * Order matters: outer providers wrap inner ones
 * 
 * QueryClientProvider is outermost to enable React Query in all contexts
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <SettingsProvider>
              <RealtimeProvider>
                <ActivityLogProvider>
                  {children}
                </ActivityLogProvider>
              </RealtimeProvider>
            </SettingsProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
      {/* DevTools only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
