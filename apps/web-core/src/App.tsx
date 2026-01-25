/**
 * App Root Component
 * 
 * Entry point for the application.
 * Wraps the router with all necessary context providers.
 */
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';
import { MaintenanceOverlay } from './components/common';
import { api } from '@superapp/core-logic';

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
