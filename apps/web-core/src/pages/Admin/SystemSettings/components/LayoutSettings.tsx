import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Save, Check } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, CardFooter } from '@/components/common';
import { cn } from '@/utils';
import { useSettings } from '@/hooks';
import { LayoutResourceRow } from './LayoutResourceRow';

export function LayoutSettings() {
  const { t } = useTranslation(['settings', 'common']);
  const { settings, updateSetting, getSettingValue } = useSettings();

  // Local state
  const [layoutConfig, setLayoutConfig] = useState<{
    global: string;
    pages: Record<string, string>;
  }>({
    global: 'standard',
    pages: {}
  });
  
  const [roleResources, setRoleResources] = useState<string[]>([]);
  const [initialLayoutConfig, setInitialLayoutConfig] = useState<{
    global: string;
    pages: Record<string, string>;
  } | null>(null);
  
  const [submitting, setSubmitting] = useState(false);

  // Sync with global settings
  useEffect(() => {
    if (settings.length > 0) {
      const rawConfig = getSettingValue('layout_config', {
        global: 'standard',
        pages: {} as Record<string, string>
      });

      // Migrate legacy config if needed
      const migratedPages = { ...rawConfig.pages };
      if (migratedPages['home']) {
        migratedPages['/'] = migratedPages['home'];
        delete migratedPages['home'];
      }
      if (migratedPages['categories']) {
        migratedPages['/categories'] = migratedPages['categories'];
        delete migratedPages['categories'];
      }

      const cleanConfig = {
        ...rawConfig,
        pages: migratedPages
      };

      setLayoutConfig(cleanConfig);
      setInitialLayoutConfig(JSON.parse(JSON.stringify(cleanConfig)) as typeof layoutConfig);

      // We also need role resources to list the pages
      const resources = getSettingValue('role_resources', []);
      setRoleResources(resources);
    }
  }, [settings, getSettingValue]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await updateSetting('layout_config', layoutConfig);
      setInitialLayoutConfig(JSON.parse(JSON.stringify(layoutConfig)) as typeof layoutConfig);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (initialLayoutConfig) {
      setLayoutConfig(JSON.parse(JSON.stringify(initialLayoutConfig)) as typeof layoutConfig);
    }
  };

  const isDirty = () => {
    if (!initialLayoutConfig) return false;
    
    if (layoutConfig.global !== initialLayoutConfig.global) return true;
    
    const currentKeys = Object.keys(layoutConfig.pages);
    const initialKeys = Object.keys(initialLayoutConfig.pages);
    
    if (currentKeys.length !== initialKeys.length) return true;
    
    for (const key of currentKeys) {
      if (layoutConfig.pages[key] !== initialLayoutConfig.pages[key]) return true;
    }
    
    return false;
  };

  // Handle layout change for a specific resource
  const handleResourceLayoutChange = (resource: string, mode: string) => {
    // Special case: "home" resource maps to "/" path (root)
    const path = resource === 'home' ? '/' : `/${resource}`;
    const newPages = { ...layoutConfig.pages };

    if (mode === 'default') {
      // Remove override to use global default
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [path]: _, ...rest } = newPages;
      setLayoutConfig({
        ...layoutConfig,
        pages: rest
      });
    } else {
      // Set specific layout mode
      setLayoutConfig({
        ...layoutConfig,
        pages: { ...newPages, [path]: mode }
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('settings:layout.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('settings:layout.description')}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Global Layout */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">{t('settings:layout.global_layout')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="ghost"
                onClick={() => { setLayoutConfig({ ...layoutConfig, global: 'standard' }); }}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-left transition-all h-auto block w-full",
                  layoutConfig.global === 'standard' 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border hover:border-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {layoutConfig.global === 'standard' && (
                  <div className="absolute top-3 right-3 text-primary">
                    <Check className="w-5 h-5" />
                  </div>
                )}
                <div className="font-bold mb-1">{t('settings:layout.modes.standard')}</div>
                <div className="text-xs opacity-70">{t('settings:layout.modes.standard_desc')}</div>
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setLayoutConfig({ ...layoutConfig, global: 'modern' }); }}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-left transition-all h-auto block w-full",
                  layoutConfig.global === 'modern' 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border hover:border-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {layoutConfig.global === 'modern' && (
                  <div className="absolute top-3 right-3 text-primary">
                    <Check className="w-5 h-5" />
                  </div>
                )}
                <div className="font-bold mb-1">{t('settings:layout.modes.modern')}</div>
                <div className="text-xs opacity-70">{t('settings:layout.modes.modern_desc')}</div>
              </Button>
            </div>
          </div>

          {/* Page Specific */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-medium text-foreground">{t('settings:layout.page_specific')}</h3>
            
            <div>
              {roleResources.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  {t('settings:roles.empty')}
                </div>
              ) : (
                roleResources.map(resource => {
                  // Special case: "home" resource maps to "/" path
                  const path = resource === 'home' ? '/' : `/${resource}`;
                  const currentMode = layoutConfig.pages[path] || 'default';
                  
                  return (
                    <LayoutResourceRow
                      key={resource}
                      resource={resource}
                      currentMode={currentMode}
                      onModeChange={handleResourceLayoutChange}
                    />
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty() || submitting}
          >
            {t('common:actions_menu.reset')}
          </Button>
          <Button 
            onClick={() => void handleSave()} 
            loading={submitting}
            disabled={!isDirty() || submitting}
            className="min-w-[140px]"
          >
            <Save className="w-4 h-4 mr-2" />
            {submitting ? t('settings:actions.saving') : t('settings:actions.save')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
