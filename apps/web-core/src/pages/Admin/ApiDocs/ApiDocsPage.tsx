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
import { FileJson, BookOpen, ChevronRight, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { useTheme } from '@/context';
import { env, STORAGE_KEYS } from '@/config';
import { getStorageItem, setStorageItem, cn } from '@/utils';
import { useLayoutMode } from '@/hooks';
import { useToast } from '@/context';
import { useEffect } from 'react';

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
// Internal Components
// ============================================================================

interface JsonNodeProps {
  data: unknown;
  name?: string | number;
  depth?: number;
  isLast?: boolean;
  initialExpanded?: boolean;
}

function JsonNode({ data, name, depth = 0, isLast = true, initialExpanded }: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded !== undefined ? initialExpanded : depth < 2);
  
  const isObject = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);
  const isEmpty = isObject && Object.keys(data).length === 0;

  const toggle = () => {
    setIsExpanded(!isExpanded);
  };

  const renderValue = (val: unknown) => {
    if (typeof val === 'string') return <span className="text-green-600 dark:text-green-400">"{val}"</span>;
    if (typeof val === 'number') return <span className="text-orange-600 dark:text-orange-400">{val}</span>;
    if (typeof val === 'boolean') return <span className="text-purple-600 dark:text-purple-400">{String(val)}</span>;
    if (val === null) return <span className="text-red-600 dark:text-red-400">null</span>;
    if (val === undefined) return <span className="text-gray-400">undefined</span>;
    if (Array.isArray(val)) return <span className="text-gray-500">[]</span>;
    if (typeof val === 'object') return <span className="text-gray-500">{"{}"}</span>;
    
    // Fallback for other types like bigint, symbol, etc.
    return <span>{String(val as string | number | boolean | bigint | symbol)}</span>;
  };

  if (!isObject || isEmpty) {
    return (
      <div className="flex items-start ml-4 py-0.5">
        <span className="text-blue-600 dark:text-blue-400 font-medium mr-2">
          {name !== undefined && `${String(name)}: `}
        </span>
        {renderValue(data)}
        {!isLast && <span className="text-gray-400">,</span>}
      </div>
    );
  }

  const keys = Object.keys(data);
  const summary = isArray ? `[ ${String(keys.length)} items ]` : `{ ${String(keys.length)} keys }`;

  return (
    <div className="ml-4 py-0.5">
      <div className="flex items-center group cursor-pointer" onClick={toggle}>
        <span className="text-gray-400 group-hover:text-primary transition-colors">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="text-blue-600 dark:text-blue-400 font-medium ml-1 mr-2">
          {name !== undefined && `${String(name)}: `}
        </span>
        <span className="text-gray-500 text-xs italic">
          {!isExpanded && summary}
        </span>
      </div>
      
      {isExpanded && (
        <div className="border-l border-gray-200 dark:border-gray-800 ml-1.5 pl-1 my-1">
          {keys.map((key, index) => (
            <JsonNode
              key={key}
              name={isArray ? index : key}
              data={(data as Record<string, unknown>)[key]}
              depth={depth + 1}
              isLast={index === keys.length - 1}
              initialExpanded={initialExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApiDocsPage() {
  const { t } = useTranslation('common');
  const { isDark } = useTheme();
  const layoutMode = useLayoutMode();
  const toast = useToast();
  
  // Setup View Mode
  const [viewMode, setViewMode] = useState<ApiDocsViewMode>(() => {
    return getStorageItem<ApiDocsViewMode>(STORAGE_KEYS.API_DOCS_VIEW_MODE) || 'reference';
  });
  
  const [rawJson, setRawJson] = useState<string>('');
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [treeKey, setTreeKey] = useState(0);
  const [defaultExpanded, setDefaultExpanded] = useState<boolean | undefined>(undefined);
  
  const specUrl = getOpenApiUrl();

  useEffect(() => {
    let isMounted = true;

    const fetchSpec = async () => {
      if (viewMode !== 'raw' || rawJson) return;

      setIsLoading(true);
      try {
        const res = await fetch(specUrl);
        const data = (await res.json()) as unknown;
        if (isMounted) {
          setRawJson(JSON.stringify(data, null, 2));
          setParsedData(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Failed to fetch OpenAPI spec:', err);
          setRawJson('Failed to load API spec');
          setParsedData(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchSpec();

    return () => {
      isMounted = false;
    };
  }, [viewMode, rawJson, specUrl]);
  
  const handleViewModeChange = (mode: ApiDocsViewMode) => {
    setViewMode(mode);
    setStorageItem(STORAGE_KEYS.API_DOCS_VIEW_MODE, mode);
  };
  
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
            title={t('api_docs:view_reference')}
            aria-label={t('api_docs:view_reference')}
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
            title={t('api_docs:view_raw')}
            aria-label={t('api_docs:view_raw')}
            aria-pressed={viewMode === 'raw'}
          >
            <FileJson className="w-4 h-4" />
            <span className="hidden sm:inline">{t('api_docs.view_raw')}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'reference' ? (
          <iframe
            key={isDark ? 'dark' : 'light'}
            title={t('api_docs.view_reference')}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : (
          <div className="w-full h-full flex flex-col bg-gray-50 dark:bg-gray-950 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center flex-1">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-auto p-4">
                {parsedData ? (
                  <div className="font-mono text-xs md:text-sm">
                    <JsonNode key={treeKey} data={parsedData} initialExpanded={defaultExpanded} />
                  </div>
                ) : (
                  <pre className="text-xs md:text-sm font-mono text-gray-800 dark:text-gray-300 whitespace-pre-wrap break-all">
                    {rawJson}
                  </pre>
                )}
              </div>
            )}
            
            {/* Actions for Raw/JSON view */}
            {!isLoading && rawJson && (
              <div className="absolute top-4 right-8 flex items-center gap-2 z-10">
                {!!parsedData && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setDefaultExpanded(true);
                        setTreeKey(prev => prev + 1);
                      }}
                      className="px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium hover:bg-muted transition-colors shadow-sm flex items-center gap-1.5"
                      title={t('api_docs.expand_all')}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{t('api_docs.expand_all')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDefaultExpanded(false);
                        setTreeKey(prev => prev + 1);
                      }}
                      className="px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium hover:bg-muted transition-colors shadow-sm flex items-center gap-1.5"
                      title={t('api_docs.collapse_all')}
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{t('api_docs.collapse_all')}</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(rawJson).then(() => {
                      toast.success(t('toast.copy_success'));
                    });
                  }}
                  className="px-3 py-1.5 bg-background border border-border rounded-md text-xs font-medium hover:bg-muted transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {t('copy')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
