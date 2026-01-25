import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingSpinner } from '@superapp/ui-kit';
import { SharedLayoutAdapter } from './components/layout/SharedLayoutAdapter';
import { ProtectedRoute, NotFoundPage } from '@/components/common';

// Lazy load pages
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EditorPage = lazy(() => import('./pages/Editor/EditorPage').then(m => ({ default: m.EditorPage })));

// Helper for lazy loading
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>}>{children}</Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SharedLayoutAdapter />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="dashboard" element={
          <ProtectedRoute>
            <LazyPage>
              <DashboardPage />
            </LazyPage>
          </ProtectedRoute>
        } />
        
        <Route path="create" element={
            <ProtectedRoute>
              <LazyPage>
                <DashboardPage /> {/* Valid temporary placeholder until CreatePage exists */}
              </LazyPage>
            </ProtectedRoute>
          } 
        />

        <Route path="library" element={
            <ProtectedRoute>
              <LazyPage>
                <DashboardPage /> {/* Valid temporary placeholder until LibraryPage exists */}
              </LazyPage>
            </ProtectedRoute>
          } 
        />

        <Route path="editor/:id" element={
          <ProtectedRoute>
            <LazyPage>
              <EditorPage />
            </LazyPage>
          </ProtectedRoute>
        } />
        
        {/* Settings placeholder */}
        <Route path="settings" element={
            <ProtectedRoute>
              <LazyPage>
                 <div className="p-8">Settings Page (Coming Soon)</div>
              </LazyPage>
            </ProtectedRoute>
          } 
        />
        
        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
