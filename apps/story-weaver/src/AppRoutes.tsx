import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProtectedRoute, NotFoundPage, EmptyState } from '@superapp/ui-kit';
import { Settings } from 'lucide-react';
import { MainLayout } from './components/layout';

// Lazy load pages
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EditorPage = lazy(() => import('./pages/Editor/EditorPage').then(m => ({ default: m.EditorPage })));

// Helper for lazy loading
function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}

const SettingsPlaceholder = () => {
    const { t } = useTranslation(['uikit']);
    return (
        <div className="p-8">
            <EmptyState 
                icon={Settings}
                title={t('uikit:settings')}
                description={t('uikit:coming_soon')}
            />
        </div>
    );
};

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
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
                <DashboardPage /> 
              </LazyPage>
            </ProtectedRoute>
          } 
        />

        <Route path="library" element={
            <ProtectedRoute>
              <LazyPage>
                <DashboardPage />
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
        
        <Route path="settings" element={
            <ProtectedRoute>
              <LazyPage>
                 <SettingsPlaceholder />
              </LazyPage>
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
