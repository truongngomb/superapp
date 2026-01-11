/**
 * AppRoutes Component
 * Centralized route configuration for the application
 * 
 * Separates routing logic from App.tsx for better maintainability
 */
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { ProtectedRoute, GuestGuard, PageLoader, NotFoundPage } from '@/components/common';
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
const ActivityLogsPage = lazy(
  () => import('@/pages/Admin/ActivityLogs/ActivityLogsPage')
);

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Wraps a lazy component with Suspense
 */
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// ============================================================================
// Route Configuration
// ============================================================================

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route
          index
          element={
            <LazyPage>
              <HomePage />
            </LazyPage>
          }
        />

        {/* Protected Categories Route */}
        <Route
          path="categories"
          element={
            <ProtectedRoute
              resource={PermissionResource.Categories}
              action={PermissionAction.View}
            >
              <LazyPage>
                <CategoriesPage />
              </LazyPage>
            </ProtectedRoute>
          }
        />

        {/* Guest Only Routes */}
        <Route
          path="login"
          element={
            <GuestGuard>
              <LazyPage>
                <LoginPage />
              </LazyPage>
            </GuestGuard>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="admin"
          element={
            <LazyPage>
              <AdminLayout />
            </LazyPage>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute
                resource={PermissionResource.Dashboard}
                action={PermissionAction.View}
              >
                <LazyPage>
                  <AdminDashboard />
                </LazyPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="users"
            element={
              <ProtectedRoute
                resource={PermissionResource.Users}
                action={PermissionAction.View}
              >
                <LazyPage>
                  <UsersPage />
                </LazyPage>
              </ProtectedRoute>
            }
          />
          <Route
            path="roles"
            element={
              <ProtectedRoute
                resource={PermissionResource.Roles}
                action={PermissionAction.View}
              >
                <LazyPage>
                  <RolesPage />
                </LazyPage>
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
                <LazyPage>
                  <ActivityLogsPage />
                </LazyPage>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
