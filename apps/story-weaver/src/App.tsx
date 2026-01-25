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
import { useState } from 'react';

// ============================================================================
// App Component
// ============================================================================

export function App() {
  return (
    <AppProviders>
      {/* Auto-detect basename based on current path for proxy support */}
      <BrowserRouter basename={useState(() => window.location.pathname.startsWith('/story-weaver') ? '/story-weaver' : '/')[0]}>
        <MaintenanceOverlay />
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  )
}
