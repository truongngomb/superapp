import { Search, Check } from 'lucide-react';
import { cn } from '@/utils';
import { useState } from 'react';
import { Input, Button } from '@/components/common';
import { useTranslation } from 'react-i18next';
import { CATEGORY_ICONS } from './icons';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  color?: string;
}

export function IconPicker({ value, onChange, color }: IconPickerProps) {
  const { t } = useTranslation('common');
  const [search, setSearch] = useState('');
  
  const filteredIcons = Object.entries(CATEGORY_ICONS).filter(([name]) => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
          placeholder={t('search_icons', { defaultValue: 'Search icons...' })}
          className="pl-9 h-9"
        />
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1 border rounded-lg bg-surface/50 scrollbar-thin scrollbar-thumb-muted">
        {filteredIcons.map(([name, Icon]) => {
          const isSelected = value === name;
          return (
            <Button
              key={name}
              variant="ghost"
              onClick={() => { onChange(name); }}
              className={cn(
                'relative flex items-center justify-center w-10 h-10 p-0 rounded-lg transition-all hover:bg-muted/10 group',
                isSelected ? 'bg-primary/10 ring-2 ring-primary/20' : 'bg-surface'
              )}
              title={name}
            >
              <Icon 
                className={cn(
                  'w-5 h-5 transition-transform group-hover:scale-110',
                  isSelected ? 'text-primary' : 'text-muted'
                )} 
                style={isSelected && color ? { color } : undefined}
              />
              {isSelected && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-sm">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </Button>
          );
        })}
        {filteredIcons.length === 0 && (
          <div className="col-span-full py-6 text-center text-sm text-muted">
            {t('no_icons_found', { defaultValue: 'No icons found' })}
          </div>
        )}
      </div>
    </div>
  );
}

