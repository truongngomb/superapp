import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageLoader } from '@/components/common';
import { useSettings } from '@/hooks';

// Sub-components
import { SettingsTabs, type Tab } from './components/SettingsTabs';
import { LayoutSettings } from './components/LayoutSettings';
import { RoleSettings } from './components/RoleSettings';
import { GeneralSettings } from './components/GeneralSettings';

export default function SystemSettingsPage() {
  const { t } = useTranslation(['settings', 'common']);
  const { settings, loading, submitting, updateSetting, getSettingValue } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('layout');

  // Local state for buffered changes
  const [layoutConfig, setLayoutConfig] = useState<{
    global: string;
    pages: Record<string, string>;
  }>({
    global: 'standard',
    pages: {}
  });

  const [roleResources, setRoleResources] = useState<string[]>([]);

  // Initial state for change detection
  const [initialLayoutConfig, setInitialLayoutConfig] = useState<{
    global: string;
    pages: Record<string, string>;
  } | null>(null);
  const [initialRoleResources, setInitialRoleResources] = useState<string[] | null>(null);

  // Sync local state when settings are loaded
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

      const resources = getSettingValue('role_resources', []);
      setRoleResources(resources);
      setInitialRoleResources([...resources]);
    }
  }, [settings, getSettingValue]);

  const handleSaveLayout = async () => {
    await updateSetting('layout_config', layoutConfig);
    setInitialLayoutConfig(JSON.parse(JSON.stringify(layoutConfig)) as typeof layoutConfig);
  };

  const handleResetLayout = () => {
    if (initialLayoutConfig) {
      setLayoutConfig(JSON.parse(JSON.stringify(initialLayoutConfig)) as typeof layoutConfig);
    }
  };

  const handleSaveRoles = async () => {
    await updateSetting('role_resources', roleResources);
    setInitialRoleResources([...roleResources]);
  };

  const handleResetRoles = () => {
    if (initialRoleResources) {
      setRoleResources([...initialRoleResources]);
    }
  };

  // Helper to check object equality for layout config
  const isLayoutDirty = () => {
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

  // Helper to check array equality for roles
  const isRolesDirty = () => {
    if (!initialRoleResources) return false;
    if (roleResources.length !== initialRoleResources.length) return true;
    return JSON.stringify(roleResources) !== JSON.stringify(initialRoleResources);
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
      <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'layout' && (
          <LayoutSettings 
            layoutConfig={layoutConfig}
            setLayoutConfig={setLayoutConfig}
            onSave={handleSaveLayout}
            onReset={handleResetLayout}
            submitting={submitting}
            roleResources={roleResources}
            disabled={!isLayoutDirty()}
          />
        )}

        {activeTab === 'roles' && (
          <RoleSettings 
            roleResources={roleResources}
            setRoleResources={setRoleResources}
            onSave={handleSaveRoles}
            onReset={handleResetRoles}
            submitting={submitting}
            disabled={!isRolesDirty()}
          />
        )}

        {activeTab === 'general' && <GeneralSettings />}
      </div>
    </div>
  );
}
