/**
 * AppProviders Component
 * Wraps the application with all context providers
 * 
 * This eliminates the "pyramid of doom" nesting in App.tsx
 */
import { type ReactNode } from 'react';
import {
  AuthProvider,
  ThemeProvider,
  ToastProvider,
  RealtimeProvider,
} from '@/context';
import { ActivityLogProvider } from '@/context/ActivityLogContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Compose multiple providers without deep nesting
 * Order matters: outer providers wrap inner ones
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <RealtimeProvider>
            <ActivityLogProvider>
              {children}
            </ActivityLogProvider>
          </RealtimeProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
