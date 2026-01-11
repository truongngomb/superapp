import { useTranslation } from 'react-i18next';
import { Layout, Save, Check } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, CardFooter } from '@/components/common';
import { cn } from '@/utils';
import { LayoutResourceRow } from './LayoutResourceRow';

interface LayoutSettingsProps {
  layoutConfig: {
    global: string;
    pages: Record<string, string>;
  };
  setLayoutConfig: (config: { global: string; pages: Record<string, string> }) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  submitting: boolean;
  roleResources: string[];
  disabled: boolean;
}

export function LayoutSettings({ layoutConfig, setLayoutConfig, onSave, onReset, submitting, roleResources, disabled }: LayoutSettingsProps) {
  const { t } = useTranslation(['settings', 'common']);

  // Handle layout change for a specific resource
  const handleResourceLayoutChange = (resource: string, mode: string) => {
    const path = `/${resource}`;
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
              <button
                onClick={() => { setLayoutConfig({ ...layoutConfig, global: 'standard' }); }}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-left transition-all",
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
                <div className="text-xs opacity-70">Standard layout with header and navigation</div>
              </button>
              <button
                onClick={() => { setLayoutConfig({ ...layoutConfig, global: 'modern' }); }}
                className={cn(
                  "relative p-4 rounded-xl border-2 text-left transition-all",
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
                <div className="text-xs opacity-70">Modern design with sticky sidebar and topbar</div>
              </button>
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
                  const path = `/${resource}`;
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
        <CardFooter className="flex items-center justify-end gap-3 bg-muted/30">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={disabled || submitting}
          >
            {t('common:actions_menu.reset')}
          </Button>
          <Button 
            onClick={() => void onSave()} 
            loading={submitting}
            disabled={disabled || submitting}
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
