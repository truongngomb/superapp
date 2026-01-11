import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings, 
  Layout, 
  Shield, 
  Save, 
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Input,
  Toggle,
  PageLoader 
} from '@/components/common';
import { useSettings } from '@/hooks';
import { cn } from '@/utils';

type Tab = 'layout' | 'roles' | 'general';

export default function SystemSettingsPage() {
  const { t } = useTranslation(['settings', 'common']);
  const { settings, loading, submitting, updateSetting, getSettingValue } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('layout');

  // Local state for buffered changes
  const [layoutConfig, setLayoutConfig] = useState({
    global: 'standard',
    pages: {
      home: 'standard',
      categories: 'standard'
    }
  });

  const [roleResources, setRoleResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');

  // Sync local state when settings are loaded
  useEffect(() => {
    if (settings.length > 0) {
      setLayoutConfig(getSettingValue('layout_config', {
        global: 'standard',
        pages: { home: 'standard', categories: 'standard' }
      }));
      setRoleResources(getSettingValue('role_resources', []));
    }
  }, [settings, getSettingValue]);

  const handleSaveLayout = async () => {
    await updateSetting('layout_config', layoutConfig);
  };

  const handleSaveRoles = async () => {
    await updateSetting('role_resources', roleResources);
  };

  const addResource = () => {
    if (newResource && !roleResources.includes(newResource)) {
      setRoleResources([...roleResources, newResource]);
      setNewResource('');
    }
  };

  const removeResource = (res: string) => {
    setRoleResources(roleResources.filter(r => r !== res));
  };

  if (loading && settings.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          {t('settings:title')}
        </h1>
        <p className="text-muted mt-1">{t('settings:subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {(['layout', 'roles', 'general'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); }}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              {tab === 'layout' && <Layout className="w-4 h-4" />}
              {tab === 'roles' && <Shield className="w-4 h-4" />}
              {tab === 'general' && <Settings className="w-4 h-4" />}
              {t(`settings:tabs.${tab}`)}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'layout' && (
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
                        "p-4 rounded-xl border-2 text-left transition-all",
                        layoutConfig.global === 'standard' 
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                          : "border-border hover:border-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="font-bold mb-1">{t('settings:layout.modes.standard')}</div>
                      <div className="text-xs opacity-70">Classic layout with header and navigation</div>
                    </button>
                    <button
                      onClick={() => { setLayoutConfig({ ...layoutConfig, global: 'modern' }); }}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        layoutConfig.global === 'modern' 
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                          : "border-border hover:border-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="font-bold mb-1">{t('settings:layout.modes.modern')}</div>
                      <div className="text-xs opacity-70">New design with sticky sidebar and topbar</div>
                    </button>
                  </div>
                </div>

                {/* Page Specific */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-medium text-foreground">{t('settings:layout.page_specific')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                      <div>
                        <div className="font-medium">{t('settings:layout.home_page')}</div>
                        <div className="text-xs text-muted-foreground">Override global layout for Home</div>
                      </div>
                      <select 
                        value={layoutConfig.pages.home}
                        onChange={(e) => {
                          setLayoutConfig({
                            ...layoutConfig,
                            pages: { ...layoutConfig.pages, home: e.target.value }
                          });
                        }}
                        className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
                      >
                        <option value="standard">Standard</option>
                        <option value="modern">Modern</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                      <div>
                        <div className="font-medium">{t('settings:layout.category_page')}</div>
                        <div className="text-xs text-muted-foreground">Override global layout for Categories</div>
                      </div>
                      <select 
                        value={layoutConfig.pages.categories}
                        onChange={(e) => {
                          setLayoutConfig({
                            ...layoutConfig,
                            pages: { ...layoutConfig.pages, categories: e.target.value }
                          });
                        }}
                        className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
                      >
                        <option value="standard">Standard</option>
                        <option value="modern">Modern</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end bg-muted/30">
                <Button 
                   onClick={() => { void handleSaveLayout(); }} 
                  loading={submitting}
                  className="min-w-[140px]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? t('settings:actions.saving') : t('settings:actions.save')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{t('settings:roles.title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('settings:roles.description')}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input 
                      placeholder={t('settings:roles.resource_placeholder')}
                      value={newResource}
                       onChange={(e) => { setNewResource(e.target.value); }}
                       onKeyDown={(e) => { if (e.key === 'Enter') addResource(); }}
                    />
                  </div>
                  <Button onClick={addResource} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('settings:roles.add_resource')}
                  </Button>
                </div>

                <div className="space-y-2">
                  {roleResources.length === 0 ? (
                    <div className="p-8 text-center bg-muted/20 rounded-xl border-2 border-dashed border-border">
                      <Shield className="w-8 h-8 text-muted mx-auto mb-2 opacity-20" />
                      <p className="text-sm text-muted-foreground">{t('settings:roles.empty')}</p>
                    </div>
                  ) : (
                    roleResources.map((res) => (
                      <div key={res} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border group hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs font-mono">
                            {res.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-medium font-mono">{res}</span>
                        </div>
                        <button 
                           onClick={() => { removeResource(res); }}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-end bg-muted/30">
                <Button 
                   onClick={() => { void handleSaveRoles(); }} 
                  loading={submitting}
                  className="min-w-[140px]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {submitting ? t('settings:actions.saving') : t('settings:actions.save')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card>
              <CardHeader>
                 <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">System Maintenance</h2>
                    <p className="text-sm text-muted-foreground">General system health and maintenance</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center text-amber-600">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-900 dark:text-amber-100">Maintenance Mode</div>
                      <div className="text-xs text-amber-700 dark:text-amber-400">Block all non-admin access to the portal</div>
                    </div>
                  </div>
                  <Toggle checked={false} onChange={() => {}} disabled />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
