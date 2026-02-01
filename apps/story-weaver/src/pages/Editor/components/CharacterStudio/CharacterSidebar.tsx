/**
 * CharacterSidebar Component
 * 
 * Sidebar for Character Studio.
 * Handles search, filtering, and the list of characters.
 */
import { useTranslation } from 'react-i18next';
import { 
  Button,
  Badge,
  Avatar,
  Skeleton
} from '@superapp/ui-kit';
import { Plus, Sparkles } from 'lucide-react';
import type { Character } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface CharacterSidebarProps {
  characters: Character[];
  selectedId?: string;
  onSelect: (character: Character) => void;
  onAdd: () => void;
  onExtract?: () => void;
  isLoading?: boolean;
}

export const CharacterSidebar = ({
  characters,
  selectedId,
  onSelect,
  onAdd,
  onExtract,
  isLoading = false,
}: CharacterSidebarProps) => {
  const { t } = useTranslation(['characters', 'uikit']);

  // TODO: Add search/filter logic here later if needed,
  // currently we can just render the list.
  
  return (
    <div className="flex flex-col h-full border-r bg-muted/10 w-[300px] shrink-0">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t('characters:panel.sidebar_title')}</h3>
          <Button size="icon" variant="ghost" onClick={onAdd}>
            <Plus size={16} />
          </Button>
        </div>



        <div className="flex gap-1">
             <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs"
                onClick={onExtract}
             >
                <Sparkles size={12} className="mr-1" />
                {t('characters:actions.extract')}
             </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="w-12 h-12 rounded-md shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))
        ) : (
        <>
        <AnimatePresence>
            {characters.map((char) => (
            <motion.div
                key={char.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
            >
                <button
                onClick={() => { onSelect(char); }}
                className={`
                    w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors
                    ${selectedId === char.id 
                    ? 'bg-primary/10 hover:bg-primary/15' 
                    : 'hover:bg-muted'}
                `}
                >
                <Avatar 
                    src={char.masterPortraitUrl} 
                    alt={char.name}
                    name={char.name}
                    className="w-12 h-12 rounded-md border"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className={`font-medium text-sm truncate ${selectedId === char.id ? 'text-primary' : ''}`}>
                            {char.name}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={char.status === 'approved' ? 'success' : 'secondary'} size="sm" className="px-1 py-0 text-[10px] h-4">
                            {t(`characters:status.${char.status}`)}
                        </Badge>
                    </div>
                </div>
                </button>
            </motion.div>
            ))}
        </AnimatePresence>

        {characters.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
                {t('characters:empty.no_characters')}
            </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};
