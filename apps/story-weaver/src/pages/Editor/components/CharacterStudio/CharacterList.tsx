/**
 * CharacterList Component
 * 
 * Displays list of characters with empty state and loading state.
 */
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { EmptyState, Skeleton } from '@superapp/ui-kit';
import { Users } from 'lucide-react';
import { CharacterCard } from './CharacterCard';
import type { Character } from '@/types';

interface CharacterListProps {
  characters: Character[];
  isLoading?: boolean;
  selectedId?: string;
  onSelect?: (character: Character) => void;
  onEdit?: (character: Character) => void;
  onDelete?: (character: Character) => void;
  onGeneratePortrait?: (character: Character) => void;
  onApprove?: (character: Character) => void;
  onExtract?: () => void;
}

// Skeleton for loading state
const CharacterCardSkeleton = () => (
  <div className="p-4 border rounded-lg">
    <div className="flex gap-3">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  </div>
);

export const CharacterList = ({
  characters,
  isLoading,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onGeneratePortrait,
  onApprove,
  onExtract,
}: CharacterListProps) => {
  const { t } = useTranslation(['characters']);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <CharacterCardSkeleton />
        <CharacterCardSkeleton />
        <CharacterCardSkeleton />
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title={t('characters:empty.title')}
        description={t('characters:empty.description')}
        actionText={onExtract ? t('characters:empty.cta') : undefined}
        onAction={onExtract}
      />
    );
  }

  return (
    <div className="space-y-3">
      {characters.map((character, index) => (
        <motion.div
          key={character.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <CharacterCard
            character={character}
            isSelected={selectedId === character.id}
            onClick={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onGeneratePortrait={onGeneratePortrait}
            onApprove={onApprove}
          />
        </motion.div>
      ))}
    </div>
  );
};
