/**
 * CharacterCard Component
 * 
 * Displays a single character with portrait, name, status, and actions.
 */
import { useTranslation } from 'react-i18next';
import { 
  Card, 
  CardContent, 
  Badge, 
  Button,
  Avatar
} from '@superapp/ui-kit';
import { User, Check, Pencil, Trash2, Image } from 'lucide-react';
import type { Character } from '@/types';

interface CharacterCardProps {
  character: Character;
  onEdit?: (character: Character) => void;
  onDelete?: (character: Character) => void;
  onGeneratePortrait?: (character: Character) => void;
  onApprove?: (character: Character) => void;
  isSelected?: boolean;
  onClick?: (character: Character) => void;
}

export const CharacterCard = ({
  character,
  onEdit,
  onDelete,
  onGeneratePortrait,
  onApprove,
  isSelected,
  onClick,
}: CharacterCardProps) => {
  const { t } = useTranslation(['characters']);

  const handleClick = () => {
    onClick?.(character);
  };

  return (
    <Card 
      className={`
        transition-all cursor-pointer hover:shadow-md
        ${isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'}
      `}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Portrait */}
          <div className="shrink-0">
            {character.masterPortraitUrl ? (
              <Avatar
                src={character.masterPortraitUrl}
                alt={character.name}
                size="lg"
                className="w-16 h-16 rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold truncate">{character.name}</h4>
                <Badge 
                  variant={character.status === 'approved' ? 'success' : 'secondary'} 
                  size="sm"
                  className="mt-1"
                >
                  {t(`characters:status.${character.status}`)}
                </Badge>
              </div>
            </div>
            
            {character.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {character.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 mt-3 pt-3 border-t" onClick={(e) => { e.stopPropagation(); }}>
          {!character.masterPortraitUrl && onGeneratePortrait && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { onGeneratePortrait(character); }}
              className="flex-1 gap-1"
            >
              <Image size={14} />
              {t('characters:actions.generate_portrait')}
            </Button>
          )}
          
          {character.status === 'draft' && character.masterPortraitUrl && onApprove && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { onApprove(character); }}
              className="gap-1"
            >
              <Check size={14} />
              {t('characters:actions.approve')}
            </Button>
          )}
          
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={() => { onEdit(character); }}
            >
              <Pencil size={14} />
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={() => { onDelete(character); }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
