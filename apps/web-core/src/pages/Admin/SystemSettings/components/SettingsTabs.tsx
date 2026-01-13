import { useTranslation } from 'react-i18next';
import { Layout, Shield, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/utils';

export type Tab = 'layout' | 'roles' | 'general';

interface SettingsTabsProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function SettingsTabs({ activeTab, setActiveTab }: SettingsTabsProps) {
  const { t } = useTranslation(['settings']);
  
  const tabs = [
    { id: 'layout', icon: Layout },
    { id: 'roles', icon: Shield },
    { id: 'general', icon: SettingsIcon },
  ] as const;

  return (
    <div className="flex border-b border-border overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as Tab); }}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {t(`settings:tabs.${tab.id}`)}
            </div>
          </button>
        );
      })}
    </div>
  );
}
