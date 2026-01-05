/**
 * App Root Component
 * Provides all context providers and routing
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { LoadingSpinner, ProtectedRoute, GuestGuard } from '@/components/common';
import { AuthProvider, ThemeProvider, ToastProvider, RealtimeProvider } from '@/context';
import { ActivityLogProvider } from '@/context/ActivityLogContext';
import { PermissionResource, PermissionAction } from '@/types';

// ============================================================================
// Lazy Loaded Pages
// ============================================================================

const HomePage = lazy(() => 
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage }))
);
const CategoriesPage = lazy(() => import('@/pages/Categories/CategoriesPage'));
const LoginPage = lazy(() => 
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RolesPage = lazy(() => import('@/pages/Admin/Roles/RolesPage'));
const UsersPage = lazy(() => import('@/pages/Admin/Users/UsersPage'));
const AdminDashboard = lazy(() => import('@/pages/Admin/AdminDashboard'));
const AdminLayout = lazy(() => import('@/pages/Admin/AdminLayout'));
const ActivityLogsPage = lazy(() => import('@/pages/Admin/ActivityLogs/ActivityLogsPage'));

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
      <ToastProvider>
        <AuthProvider>
          <RealtimeProvider>
            <ActivityLogProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<MainLayout />}>
                  {/* Public Routes */}
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
                    <ProtectedRoute
                      resource={PermissionResource.Categories}
                      action={PermissionAction.View}
                    >
                      <Suspense fallback={<PageLoader />}>
                        <CategoriesPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                
                {/* Guest Only Routes (redirect to home if already logged in) */}
                <Route
                  path="login"
                  element={
                    <GuestGuard>
                      <Suspense fallback={<PageLoader />}>
                        <LoginPage />
                      </Suspense>
                    </GuestGuard>
                  }
                />
                
                {/* Protected Admin Routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute 
                      resource={PermissionResource.Users} 
                      action={PermissionAction.View}
                    >
                      <Suspense fallback={<PageLoader />}>
                        <AdminLayout />
                      </Suspense>
                    </ProtectedRoute>
                  }
                >
                  {/* Default redirect to dashboard */}
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <Suspense fallback={<PageLoader />}>
                        <UsersPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="roles"
                    element={
                      <ProtectedRoute 
                        resource={PermissionResource.Roles} 
                        action={PermissionAction.View}
                      >
                        <Suspense fallback={<PageLoader />}>
                          <RolesPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="activity-logs"
                    element={
                      <ProtectedRoute 
                        resource={PermissionResource.Roles} 
                        action={PermissionAction.View}
                      >
                        <Suspense fallback={<PageLoader />}>
                          <ActivityLogsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                </Route>
                
                  {/* Catch-all 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ActivityLogProvider>
        </RealtimeProvider>
      </AuthProvider>
    </ToastProvider>
  </ThemeProvider>
);
}

