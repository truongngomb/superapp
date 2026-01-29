/**
 * CharacterForm Component
 * 
 * Form for creating/editing a character with name and description.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Input, 
  Textarea, 
  Button,
  FormItem,
  FormLabel,
  FormDescription
} from '@superapp/ui-kit';
import { Save, X } from 'lucide-react';
import type { Character, CreateCharacterInput, UpdateCharacterInput } from '@/types';

interface CharacterFormProps {
  character?: Character;
  projectId: string;
  onSave: (data: CreateCharacterInput | UpdateCharacterInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CharacterForm = ({
  character,
  projectId,
  onSave,
  onCancel,
  isLoading,
}: CharacterFormProps) => {
  const { t } = useTranslation(['characters', 'uikit']);
  const isEditing = !!character;

  // Initialize state from props - parent should use key={character?.id} to reset form
  const [name, setName] = useState(character?.name ?? '');
  const [description, setDescription] = useState(character?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t('characters:form.name_required'));
      return;
    }

    if (isEditing) {
      onSave({
        name: name.trim(),
        description: description.trim() || undefined,
      } as UpdateCharacterInput);
    } else {
      onSave({
        projectId,
        name: name.trim(),
        description: description.trim() || undefined,
      } as CreateCharacterInput);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormItem>
        <FormLabel>
          {t('characters:form.name_label')} <span className="text-destructive">*</span>
        </FormLabel>
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); }}
          placeholder={t('characters:form.name_placeholder')}
          className={error ? 'border-destructive' : ''}
          autoFocus
        />
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>{t('characters:form.description_label')}</FormLabel>
        <Textarea
          value={description}
          onChange={(e) => { setDescription(e.target.value); }}
          placeholder={t('characters:form.description_placeholder')}
          className="min-h-[120px]"
        />
        <FormDescription>
          {t('characters:form.description_hint')}
        </FormDescription>
      </FormItem>

      <div className="flex gap-2 justify-end pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          <X size={16} className="mr-1" />
          {t('uikit:cancel')}
        </Button>
        <Button 
          type="submit" 
          loading={isLoading}
        >
          <Save size={16} className="mr-1" />
          {t('characters:actions.save')}
        </Button>
      </div>
    </form>
  );
};
