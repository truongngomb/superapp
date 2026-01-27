import { GripVertical, ArrowUp, ArrowDown, Trash2, FolderInput } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  Button,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@superapp/ui-kit';
import type { ResourceGroup } from '@superapp/shared-types';

interface RoleResourceRowProps {
  res: string;
  index: number;
  total: number;
  currentGroupId: string;
  allGroups: ResourceGroup[];
  onRemove: (res: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToGroup: (res: string, fromGroupId: string, toGroupId: string) => void;
}

export function RoleResourceRow({ 
  res, 
  index, 
  total, 
  currentGroupId,
  allGroups,
  onRemove, 
  onMoveUp, 
  onMoveDown,
  onMoveToGroup,
}: RoleResourceRowProps) {
  const { t } = useTranslation(['uikit', 'settings']);

  // Available groups to move to (exclude current group)
  const otherGroups = allGroups.filter(g => g.id !== currentGroupId);

  const handleGroupChange = (groupId: string) => {
    if (groupId && groupId !== currentGroupId) {
      onMoveToGroup(res, currentGroupId, groupId);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border group hover:border-primary/50 transition-colors mb-2">
      <div className="flex items-center gap-3">
        <div className="p-1 text-muted-foreground/50">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs text-primary font-mono select-none">
          {res.substring(0, 2).toUpperCase()}
        </div>
        <span className="font-medium font-mono">{res}</span>
      </div>
      <div className="flex items-center gap-1">
        {/* Move to Group Select */}
        {otherGroups.length > 0 && (
          <Select value="" onValueChange={handleGroupChange}>
            <SelectTrigger className="w-[140px] h-9">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FolderInput className="w-4 h-4" />
                <span className="text-xs">{t('settings:roles.groups.move_to_group')}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-background">
              {otherGroups.map(group => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoveUp}
          disabled={index === 0}
          className="h-9 w-9 p-0"
          title={t('uikit:actions.move_up')}
        >
          <ArrowUp className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="h-9 w-9 p-0"
          title={t('uikit:actions.move_down')}
        >
          <ArrowDown className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => { onRemove(res); }}
          className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
          title={t('uikit:actions.remove')}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
