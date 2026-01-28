import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Save, Plus, FolderPlus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, CardFooter, Input } from '@superapp/ui-kit';
import { useSettings } from '@superapp/core-logic';
import { RoleResourceRow } from './RoleResourceRow';
import type { ResourceGroup } from '@superapp/shared-types';
import { isLegacyRoleResources } from '@superapp/shared-types';
import { migrateLegacyRoleResources } from '@superapp/core-logic';

import { PERMISSIONS } from '@/config/constants';

// Generate unique ID for new groups
const generateId = () => `group_${String(Date.now())}_${Math.random().toString(36).slice(2, 9)}`;

export function RoleSettings() {
  const { t } = useTranslation(['settings', 'uikit']);
  const { settings, updateSetting, getSettingValue, loading } = useSettings();

  // Local state - now using grouped format
  const [resourceGroups, setResourceGroups] = useState<ResourceGroup[]>([]);
  const [initialResourceGroups, setInitialResourceGroups] = useState<ResourceGroup[] | null>(null);
  const [newResource, setNewResource] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Editing group name
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');

  // Sync with global settings (with migration support)
  useEffect(() => {
    if (!loading) {
      const rawData = getSettingValue('role_resources', PERMISSIONS.RESOURCES as string[]);
      
      let groups: ResourceGroup[];
      
      // Check if data is in legacy format and migrate if needed
      if (isLegacyRoleResources(rawData)) {
        groups = migrateLegacyRoleResources(rawData, t('settings:roles.groups.ungrouped'));
      } else {
        groups = rawData as ResourceGroup[];
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
      setInitialResourceGroups(JSON.parse(JSON.stringify(sanitizedGroups)) as ResourceGroup[]);
    }
  }, [loading, settings, getSettingValue, t]);


  const handleSave = async () => {
    setSubmitting(true);
    try {
      // Set visibility to 'public' so all users can see role resources for layout config
      await updateSetting('role_resources', resourceGroups, 'public');
      setInitialResourceGroups(JSON.parse(JSON.stringify(resourceGroups)) as ResourceGroup[]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (initialResourceGroups) {
      setResourceGroups(JSON.parse(JSON.stringify(initialResourceGroups)) as ResourceGroup[]);
    }
  };

  const isDirty = useCallback(() => {
    if (!initialResourceGroups) return false;
    return JSON.stringify(resourceGroups) !== JSON.stringify(initialResourceGroups);
  }, [resourceGroups, initialResourceGroups]);

  // Add new resource to the first group (or create default group if none exists)
  const addResource = () => {
    if (!newResource.trim()) return;
    
    // Check if resource already exists in any group
    const exists = resourceGroups.some(g => g.resources.includes(newResource.trim()));
    if (exists) return;

    setResourceGroups(prev => {
      if (prev.length === 0) {
        // Create default group if none exists
        return [{
          id: 'default',
          name: t('settings:roles.groups.ungrouped'),
          resources: [newResource.trim()],
          order: 0,
        }];
      }
      
      // Add to first group
      const updated = [...prev];
      if (updated[0]) {
        updated[0] = {
          ...updated[0],
          resources: [...updated[0].resources, newResource.trim()],
        };
      }
      return updated;
    });
    setNewResource('');
  };

  // Add new group
  const addGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: ResourceGroup = {
      id: generateId(),
      name: newGroupName.trim(),
      resources: [],
      order: resourceGroups.length,
    };
    
    setResourceGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
  };

  // Start editing group name
  const startEditGroup = (group: ResourceGroup) => {
    setEditingGroupId(group.id);
    setEditGroupName(group.name);
  };

  // Save group name
  const saveGroupName = () => {
    if (!editingGroupId || !editGroupName.trim()) return;
    
    setResourceGroups(prev => 
      prev.map(g => g.id === editingGroupId ? { ...g, name: editGroupName.trim() } : g)
    );
    setEditingGroupId(null);
    setEditGroupName('');
  };

  // Cancel editing
  const cancelEditGroup = () => {
    setEditingGroupId(null);
    setEditGroupName('');
  };

  // Delete a group (move its resources to the first group or create ungrouped)
  const deleteGroup = (groupId: string) => {
    setResourceGroups(prev => {
      const groupToDelete = prev.find(g => g.id === groupId);
      if (!groupToDelete) return prev;

      const orphanedResources = groupToDelete.resources;
      const remainingGroups = prev.filter(g => g.id !== groupId);

      if (remainingGroups.length === 0) {
        // Create default group with orphaned resources
        return [{
          id: 'default',
          name: t('settings:roles.groups.ungrouped'),
          resources: orphanedResources,
          order: 0,
        }];
      }

      // Move orphaned resources to first remaining group
      if (orphanedResources.length > 0 && remainingGroups[0]) {
        remainingGroups[0] = {
          ...remainingGroups[0],
          resources: [...remainingGroups[0].resources, ...orphanedResources],
        };
      }

      return remainingGroups;
    });
  };

  // Remove a resource from a specific group
  const removeResource = (resourceId: string, groupId: string) => {
    setResourceGroups(prev => 
      prev.map(g => 
        g.id === groupId 
          ? { ...g, resources: g.resources.filter(r => r !== resourceId) }
          : g
      )
    );
  };

  // Move resource between groups
  const moveResource = (resourceId: string, fromGroupId: string, toGroupId: string) => {
    if (fromGroupId === toGroupId) return;
    
    setResourceGroups(prev => {
      return prev.map(g => {
        if (g.id === fromGroupId) {
          return { ...g, resources: g.resources.filter(r => r !== resourceId) };
        }
        if (g.id === toGroupId) {
          return { ...g, resources: [...g.resources, resourceId] };
        }
        return g;
      });
    });
  };

  // Move resource up within a group
  const moveResourceUp = (groupId: string, index: number) => {
    if (index <= 0) return;
    setResourceGroups(prev => 
      prev.map(g => {
        if (g.id !== groupId) return g;
        const newResources = [...g.resources];
        const current = newResources[index];
        const prev = newResources[index - 1];
        if (current && prev) {
          newResources[index] = prev;
          newResources[index - 1] = current;
        }
        return { ...g, resources: newResources };
      })
    );
  };

  // Move resource down within a group
  const moveResourceDown = (groupId: string, index: number) => {
    setResourceGroups(prev => 
      prev.map(g => {
        if (g.id !== groupId) return g;
        if (index >= g.resources.length - 1) return g;
        const newResources = [...g.resources];
        const current = newResources[index];
        const next = newResources[index + 1];
        if (current && next) {
          newResources[index] = next;
          newResources[index + 1] = current;
        }
        return { ...g, resources: newResources };
      })
    );
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
          {/* Add Resource */}
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

          {/* Add Group */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input 
                placeholder={t('settings:roles.groups.group_name')}
                value={newGroupName}
                onChange={(e) => { setNewGroupName(e.target.value); }}
                onKeyDown={(e) => { if (e.key === 'Enter') addGroup(); }}
              />
            </div>
            <Button onClick={addGroup} variant="outline">
              <FolderPlus className="w-4 h-4 mr-2" />
              {t('settings:roles.groups.add_group')}
            </Button>
          </div>

          {/* Resource Groups - Same style as LayoutSettings */}
          <div className="space-y-4 pt-4 border-t border-border">
            {resourceGroups.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 rounded-xl border-2 border-dashed border-border h-[200px] flex flex-col items-center justify-center">
                <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                <p className="text-sm text-muted-foreground">{t('settings:roles.empty')}</p>
              </div>
            ) : (
              resourceGroups.map(group => (
                <div key={group.id} className="space-y-2">
                  {/* Group Header */}
                  <div className="flex items-center justify-between">
                    {editingGroupId === group.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editGroupName}
                          onChange={(e) => { setEditGroupName(e.target.value); }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveGroupName();
                            if (e.key === 'Escape') cancelEditGroup();
                          }}
                          className="h-8 w-40"
                          autoFocus
                        />
                        <Button variant="ghost" size="sm" onClick={saveGroupName} className="h-8 w-8 p-0 text-green-500">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={cancelEditGroup} className="h-8 w-8 p-0 text-red-500">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {group.name}
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {group.resources.length}
                        </span>
                      </h4>
                    )}
                    
                    {editingGroupId !== group.id && group.id !== 'default' && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { startEditGroup(group); }}
                          className="h-8 w-8 p-0"
                          title={t('uikit:actions.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { deleteGroup(group.id); }}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title={t('uikit:actions.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Resources List */}
                  <div>
                    {group.resources.length === 0 ? (
                      <div className="p-4 text-center bg-muted/10 rounded-lg border-2 border-dashed border-border">
                        <p className="text-sm text-muted-foreground">
                          {t('settings:roles.groups.empty_group')}
                        </p>
                      </div>
                    ) : (
                      group.resources.map((res, index) => (
                        <RoleResourceRow
                          key={res}
                          res={res}
                          index={index}
                          total={group.resources.length}
                          currentGroupId={group.id}
                          allGroups={resourceGroups}
                          onRemove={(resourceId) => { removeResource(resourceId, group.id); }}
                          onMoveUp={() => { moveResourceUp(group.id, index); }}
                          onMoveDown={() => { moveResourceDown(group.id, index); }}
                          onMoveToGroup={moveResource}
                        />
                      ))
                    )}
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
