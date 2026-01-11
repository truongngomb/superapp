import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Save, Plus } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, CardFooter, Input } from '@/components/common';
import { Reorder } from 'framer-motion';
import { RoleResourceRow } from './RoleResourceRow';

interface RoleSettingsProps {
  roleResources: string[];
  setRoleResources: (resources: string[]) => void;
  onSave: () => Promise<void>;
  onReset: () => void;
  submitting: boolean;
  disabled: boolean;
}

export function RoleSettings({ roleResources, setRoleResources, onSave, onReset, submitting, disabled }: RoleSettingsProps) {
  const { t } = useTranslation(['settings', 'common']);
  const [newResource, setNewResource] = useState('');

  const addResource = () => {
    if (newResource && !roleResources.includes(newResource)) {
      setRoleResources([...roleResources, newResource]);
      setNewResource('');
    }
  };

  const removeResource = (res: string) => {
    setRoleResources(roleResources.filter(r => r !== res));
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      const newResources = [...roleResources];
      const current = newResources[index];
      const prev = newResources[index - 1];
      if (current && prev) {
        newResources[index] = prev;
        newResources[index - 1] = current;
        setRoleResources(newResources);
      }
    }
  };

  const moveDown = (index: number) => {
    if (index < roleResources.length - 1) {
      const newResources = [...roleResources];
      const current = newResources[index];
      const next = newResources[index + 1];
      if (current && next) {
        newResources[index] = next;
        newResources[index + 1] = current;
        setRoleResources(newResources);
      }
    }
  };

  return (
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

          <div className="min-h-[200px]">
            {roleResources.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 rounded-xl border-2 border-dashed border-border h-[200px] flex flex-col items-center justify-center">
                <Shield className="w-8 h-8 text-muted mx-auto mb-2 opacity-20" />
                <p className="text-sm text-muted-foreground">{t('settings:roles.empty')}</p>
              </div>
            ) : (
              <Reorder.Group axis="y" values={roleResources} onReorder={setRoleResources}>
                {roleResources.map((res, index) => (
                  <RoleResourceRow
                    key={res}
                    res={res}
                    index={index}
                    total={roleResources.length}
                    onRemove={removeResource}
                    onMoveUp={moveUp}
                    onMoveDown={moveDown}
                  />
                ))}
              </Reorder.Group>
            )}
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
