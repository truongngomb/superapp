/**
 * App Root Component
 * Provides all context providers and routing
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { LoadingSpinner } from '@/components/common';
import { AuthProvider, ThemeProvider } from '@/context';

// ============================================================================
// Lazy Loaded Pages
// ============================================================================

const HomePage = lazy(() => 
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const CategoriesPage = lazy(() => 
  import('@/pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const LoginPage = lazy(() => 
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RolesPage = lazy(() => import('@/pages/Admin/RolesPage'));

// ============================================================================
// Fallback Components
// ============================================================================

/**
 * Loading state for lazy-loaded pages
 */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

/**
 * 404 Not Found page
 */
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
      <p className="text-xl text-muted mb-6">Page not found</p>
      <Link 
        to="/" 
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

// ============================================================================
// App Component
// ============================================================================

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <HomePage />
                  </Suspense>
                }
              />
              <Route
                path="categories"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <CategoriesPage />
                  </Suspense>
                }
              />
              <Route
                path="login"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <LoginPage />
                  </Suspense>
                }
              />
              <Route
                path="admin/roles"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <RolesPage />
                  </Suspense>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
