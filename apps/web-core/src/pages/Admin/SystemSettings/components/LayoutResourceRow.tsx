import { useTranslation } from 'react-i18next';
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/common';

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
      <div className="flex items-center justify-end w-[250px]">
         <Select
          value={currentMode}
          onValueChange={(value) => { onModeChange(resource, value); }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background">
            <SelectItem value="default">{t('settings:layout.modes.default')} ({t('settings:layout.global_layout')})</SelectItem>
            <SelectItem value="standard">{t('settings:layout.modes.standard')}</SelectItem>
            <SelectItem value="modern">{t('settings:layout.modes.modern')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
