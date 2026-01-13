import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const { settings, loading } = useSettings();
  
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL hash
  const getActiveTab = (): Tab => {
    const hash = location.hash.replace('#', '');
    const validTabs: Tab[] = ['layout', 'roles', 'general'];
    if (validTabs.includes(hash as Tab)) {
      return hash as Tab;
    }
    return 'layout';
  };

  const activeTab = getActiveTab();

  // Handle default hash
  useEffect(() => {
    if (!location.hash) {
      void navigate('#layout', { replace: true });
    }
  }, [location.hash, navigate]);

  const handleTabChange = (tab: Tab) => {
    void navigate(`#${tab}`);
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
      <SettingsTabs activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Content */}
      <div className="mt-6">
        {activeTab === 'layout' && <LayoutSettings />}
        {activeTab === 'roles' && <RoleSettings />}
        {activeTab === 'general' && <GeneralSettings />}
      </div>
    </div>
  );
}
