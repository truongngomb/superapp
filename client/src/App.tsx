/**
 * App Root Component
 * 
 * Entry point for the application.
 * Wraps the router with all necessary context providers.
 */
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';
import { AppRoutes } from './AppRoutes';

// ============================================================================
// App Component
// ============================================================================

export function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  );
}
