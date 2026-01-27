/**
 * App Root Component
 * 
 * Entry point for the application.
 * Wraps the router with all necessary context providers.
 */
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';
import { api } from '@superapp/core-logic';
import { MaintenanceOverlay } from '@superapp/ui-kit';

// ============================================================================
// App Component
// ============================================================================

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <MaintenanceOverlay onCheckHealth={async () => { await api.get('/health') }} />
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
