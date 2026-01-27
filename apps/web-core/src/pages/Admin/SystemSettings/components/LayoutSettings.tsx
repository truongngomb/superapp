import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Save, Check } from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
} from '@superapp/ui-kit';
import { cn } from '@/utils';
import { useSettings } from '@superapp/core-logic';
import { LayoutResourceRow } from './LayoutResourceRow';
import type { 
  ResourceGroup, 
  LayoutConfig, 
  LayoutMode,
  LayoutPathConfig,
} from '@superapp/shared-types';
import { 
  isLegacyRoleResources,
} from '@superapp/shared-types';
import { 
  migrateLegacyRoleResources,
} from '@superapp/core-logic';

import { PERMISSIONS } from '@/config/constants';

export function LayoutSettings() {
  const { t } = useTranslation(['settings', 'uikit']);
  const { settings, updateSetting, getSettingValue, loading } = useSettings();

  // Local state - using new format
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    global: 'standard',
    paths: []
  });
  
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [initialLayoutConfig, setInitialLayoutConfig] = useState<LayoutConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sync with global settings
  useEffect(() => {
    if (!loading) {
      // Load layout config with migration support
      const config = getSettingValue('layout_config', {
        global: 'standard',
        paths: []
      }) as LayoutConfig;

      setLayoutConfig(config);
      setInitialLayoutConfig(JSON.parse(JSON.stringify(config)) as LayoutConfig);

      // Load role resources with migration support
      const rawResources = getSettingValue('role_resources', PERMISSIONS.RESOURCES as string[]);
      
      let groups: ResourceGroup[];
      if (isLegacyRoleResources(rawResources)) {
        groups = migrateLegacyRoleResources(rawResources, t('settings:roles.groups.ungrouped'));
      } else {
        groups = rawResources as ResourceGroup[];
      }
      
      // Sanitize data to ensure all ids and resources are strings
      const sanitizedGroups = groups.map((g, index) => ({
        id: typeof g.id === 'string' ? g.id : `group_${String(index)}`,
        name: typeof g.name === 'string' ? g.name : `Group ${String(index + 1)}`,
        resources: Array.isArray(g.resources) 
          ? g.resources.filter((r): r is string => typeof r === 'string')
          : [],
        order: typeof g.order === 'number' ? g.order : index,
      }));
      
      setResourceGroups(sanitizedGroups);
    }
  }, [loading, settings, getSettingValue, t]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      // Set visibility to 'public' so all users can see layout config
      await updateSetting('layout_config', layoutConfig, 'public');
      setInitialLayoutConfig(JSON.parse(JSON.stringify(layoutConfig)) as LayoutConfig);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (initialLayoutConfig) {
      setLayoutConfig(JSON.parse(JSON.stringify(initialLayoutConfig)) as LayoutConfig);
    }
  };

  const isDirty = useCallback(() => {
    if (!initialLayoutConfig) return false;
    return JSON.stringify(layoutConfig) !== JSON.stringify(initialLayoutConfig);
  }, [layoutConfig, initialLayoutConfig]);

  // Handle layout change for a specific resource
  const handleResourceLayoutChange = (resource: string, mode: string) => {
    const path = resource === 'home' ? '/' : `/${resource}`;
    
    setLayoutConfig(prev => {
      const existingIndex = prev.paths.findIndex(p => p.pattern === path);
      
      if (mode === 'default') {
        // Remove the path config
        return {
          ...prev,
          paths: prev.paths.filter(p => p.pattern !== path)
        };
      }

      if (existingIndex >= 0) {
        // Update existing
        const newPaths = [...prev.paths];
        const existingPath = newPaths[existingIndex];
        if (existingPath) {
          newPaths[existingIndex] = {
            ...existingPath,
            mode: mode as LayoutMode | 'default',
          };
        }
        return { ...prev, paths: newPaths };
      }

      // Add new
      const newPath: LayoutPathConfig = { 
        pattern: path, 
        mode: mode as LayoutMode | 'default', 
        priority: 100 
      };
      return {
        ...prev,
        paths: [...prev.paths, newPath]
      };
    });
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

          {/* Page Specific by Resource Groups */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-medium text-foreground">{t('settings:layout.page_specific')}</h3>
            
            {resourceGroups.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                {t('settings:roles.empty')}
              </div>
            ) : (
              resourceGroups.map(group => (
                <div key={group.id} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    {group.name}
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {group.resources.length}
                    </span>
                  </h4>
                  <div>
                    {group.resources.map(resource => {
                      const path = resource === 'home' ? '/' : `/${resource}`;
                      const pathConfig = layoutConfig.paths.find(p => p.pattern === path);
                      const currentMode = pathConfig?.mode ?? 'default';
                      
                      return (
                        <LayoutResourceRow
                          key={resource}
                          resource={resource}
                          currentMode={currentMode}
                          onModeChange={handleResourceLayoutChange}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty() || submitting}
          >
            {t('uikit:actions_menu.reset')}
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
