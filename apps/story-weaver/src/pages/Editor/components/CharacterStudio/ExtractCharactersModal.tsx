/**
 * ExtractCharactersModal Component
 * 
 * Modal for AI character extraction from story with suggestions list.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Modal, 
  Button, 
  Checkbox,
  Badge,
  LoadingSpinner
} from '@superapp/ui-kit';
import { Sparkles, UserPlus, Users } from 'lucide-react';
import type { CharacterSuggestion } from '@/types';

interface ExtractCharactersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: CharacterSuggestion[];
  isExtracting: boolean;
  onExtract: () => void;
  onAddSelected: (suggestions: CharacterSuggestion[]) => void;
  isAdding: boolean;
}

export const ExtractCharactersModal = ({
  open,
  onOpenChange,
  suggestions,
  isExtracting,
  onExtract,
  onAddSelected,
  isAdding,
}: ExtractCharactersModalProps) => {
  const { t } = useTranslation(['characters', 'uikit']);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelect = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const handleAddSelected = () => {
    const selectedSuggestions = suggestions.filter((_, idx) => selected.has(idx));
    onAddSelected(selectedSuggestions);
  };

  const handleAddAll = () => {
    onAddSelected(suggestions);
  };

  const handleClose = () => {
    setSelected(new Set());
    onOpenChange(false);
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {t('characters:extract.title')}
        </span>
      }
      description={t('characters:extract.description')}
      size="lg"
    >
      {/* Content */}
      <div className="py-4">
        {isExtracting ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">
              {t('characters:extract.extracting')}
            </p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {t('characters:extract.no_characters')}
            </p>
            <Button onClick={onExtract} className="mt-4">
              <Sparkles size={16} className="mr-2" />
              {t('characters:actions.extract')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">
                {t('characters:extract.found_title')} ({suggestions.length})
              </h4>
              <p className="text-sm text-muted-foreground">
                {t('characters:extract.found_description')}
              </p>
            </div>

            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all
                  ${selected.has(index) 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'}
                `}
                onClick={() => { toggleSelect(index); }}
              >
                <div className="flex items-start gap-3">
                  <Checkbox 
                    checked={selected.has(index)} 
                    onCheckedChange={() => { toggleSelect(index); }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{suggestion.name}</h5>
                      {suggestion.confidence && (
                        <Badge variant="secondary" size="sm">
                          {t('characters:extract.confidence')}: {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                    {suggestion.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {suggestion.description}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {suggestions.length > 0 && !isExtracting && (
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            {t('uikit:cancel')}
          </Button>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleAddAll}
              loading={isAdding}
            >
              <Users size={16} className="mr-1" />
              {t('characters:extract.add_all')}
            </Button>
            <Button 
              onClick={handleAddSelected}
              disabled={selected.size === 0}
              loading={isAdding}
            >
              <UserPlus size={16} className="mr-1" />
              {t('characters:extract.add_selected')} ({selected.size})
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
