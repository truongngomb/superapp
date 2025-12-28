import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { LoadingSpinner } from '@/components/common';
import { AuthProvider } from '@/context';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const CategoriesPage = lazy(() => import('@/pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const RolesPage = lazy(() => import('@/pages/Admin/RolesPage'));

// Fallback component for Suspense
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

// 404 Page
function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-6xl font-bold text-gradient mb-4">404</h1>
      <p className="text-xl text-muted mb-6">Page not found</p>
      <a href="/" className="btn-primary px-6 py-2">
        Back to Home
      </a>
    </div>
  );
}

export function App() {
  return (
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
  );
}
