import { useTranslation } from 'react-i18next';

interface LayoutResourceRowProps {
  resource: string;
  currentMode: string;
  onModeChange: (resource: string, mode: string) => void;
}

export function LayoutResourceRow({ resource, currentMode, onModeChange }: LayoutResourceRowProps) {
  const { t } = useTranslation(['settings']);

  return (
    <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border group hover:border-primary/50 transition-colors mb-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs text-primary font-mono select-none">
          {resource.substring(0, 2).toUpperCase()}
        </div>
        <span className="font-medium font-mono">{resource}</span>
      </div>
      <div className="w-[200px]">
         <select
          value={currentMode}
          onChange={(e) => { onModeChange(resource, e.target.value); }}
          className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm h-9 focus:ring-1 focus:ring-primary focus:border-primary"
        >
          <option value="default">{t('settings:layout.modes.default')} (Global)</option>
          <option value="standard">{t('settings:layout.modes.standard')}</option>
          <option value="modern">{t('settings:layout.modes.modern')}</option>
        </select>
      </div>
    </div>
  );
}
