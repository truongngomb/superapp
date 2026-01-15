/**
 * API Documentation Page
 * 
 * Renders Scalar API Reference UI for interactive API documentation.
 * Only accessible by Admin users.
 * 
 * Uses iframe approach to isolate Scalar UI CSS from the main app.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileJson, BookOpen } from 'lucide-react';
import { useTheme } from '@/context';
import { env, STORAGE_KEYS } from '@/config';
import { getStorageItem, setStorageItem, cn } from '@/utils';
import { useLayoutMode } from '@/hooks';

// ============================================================================
// Types
// ============================================================================

type ApiDocsViewMode = 'reference' | 'raw';

// ============================================================================
// Helper
// ============================================================================

/**
 * Build the OpenAPI spec URL
 * Handles both relative (/api) and absolute (http://...) URLs
 */
function getOpenApiUrl(): string {
  const baseUrl = env.API_BASE_URL;
  // If base URL is relative, use current origin
  if (baseUrl.startsWith('/')) {
    return `${window.location.origin}${baseUrl}/openapi.json`;
  }
  return `${baseUrl}/openapi.json`;
}

/**
 * Generate Scalar UI HTML content for iframe
 */
function generateScalarHtml(specUrl: string, isDark: boolean): string {
  // Scalar configuration
  const config = JSON.stringify({
    darkMode: isDark,
    theme: 'purple', // You can change this to 'default', 'blue', etc.
    showSidebar: true,
  });

  return `
<!DOCTYPE html>
<html lang="en" class="${isDark ? 'dark-mode' : 'light-mode'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SuperApp API Documentation</title>
  <style>
    /* Prevent white flash in dark mode */
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background-color: ${isDark ? '#0f172a' : '#ffffff'};
      color: ${isDark ? '#f8fafc' : '#0f172a'};
    }
    /* Simple scrollbar theme */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: ${isDark ? '#1e293b' : '#f1f5f9'};
    }
    ::-webkit-scrollbar-thumb {
      background: ${isDark ? '#475569' : '#cbd5e1'};
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${isDark ? '#64748b' : '#94a3b8'};
    }
  </style>
</head>
<body class="${isDark ? 'dark-mode' : 'light-mode'}">
  <script id="api-reference" data-url="${specUrl}" data-configuration='${config}'></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>
  `.trim();
}

// ============================================================================
// Component
// ============================================================================

export default function ApiDocsPage() {
  const { t } = useTranslation('common');
  const { isDark } = useTheme();
  const layoutMode = useLayoutMode();
  
  // Setup View Mode
  const [viewMode, setViewMode] = useState<ApiDocsViewMode>(() => {
    return getStorageItem<ApiDocsViewMode>(STORAGE_KEYS.API_DOCS_VIEW_MODE as string) || 'reference';
  });
  
  const handleViewModeChange = (mode: ApiDocsViewMode) => {
    setViewMode(mode);
    setStorageItem(STORAGE_KEYS.API_DOCS_VIEW_MODE as string, mode);
  };
  
  const specUrl = getOpenApiUrl();
  const htmlContent = generateScalarHtml(specUrl, isDark);

  return (
    <div className={cn(
      "w-full flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800",
      layoutMode === 'modern' ? "h-[calc(100vh-5rem)]" : "h-[calc(100vh-10rem)]"
    )}>
      {/* View Mode Switcher */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1 bg-muted/20 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              handleViewModeChange('reference');
            }}
            className={cn(
              'px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium',
              viewMode === 'reference'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-muted/30'
            )}
            title={t('api_docs.view_reference', { defaultValue: 'Interactive Reference' })}
            aria-label={t('api_docs.view_reference', { defaultValue: 'Interactive Reference' })}
            aria-pressed={viewMode === 'reference'}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">{t('api_docs.view_reference')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleViewModeChange('raw');
            }}
            className={cn(
              'px-3 py-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium',
              viewMode === 'raw'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-muted/30'
            )}
            title={t('api_docs.view_raw', { defaultValue: 'Raw JSON' })}
            aria-label={t('api_docs.view_raw', { defaultValue: 'Raw JSON' })}
            aria-pressed={viewMode === 'raw'}
          >
            <FileJson className="w-4 h-4" />
            <span className="hidden sm:inline">{t('api_docs.view_raw')}</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'reference' ? (
          <iframe
            key={isDark ? 'dark' : 'light'}
            title={t('api_docs.view_reference')}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <iframe
            title={t('api_docs.view_raw')}
            src={specUrl}
            className="w-full h-full border-0 bg-white dark:bg-gray-950"
            sandbox="allow-scripts allow-same-origin"
          />
        )}
      </div>
    </div>
  );
}
