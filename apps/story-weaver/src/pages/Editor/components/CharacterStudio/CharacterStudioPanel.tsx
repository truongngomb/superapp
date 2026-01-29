/**
 * CharacterStudioPanel Component
 * 
 * Main panel for Character Studio in the Editor.
 * Handles character list, form, portrait gallery, and AI extraction.
 */
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Button, 
  ConfirmModal,
  useToast
} from '@superapp/ui-kit';
import { Plus, Sparkles, ChevronLeft } from 'lucide-react';
import { 
  useCharacters, 
  useCreateCharacter, 
  useUpdateCharacter,
  useDeleteCharacter,
  useExtractCharacters,
  useCreateFromSuggestions,
  useApproveCharacter
} from '@/hooks';
import { useGeneratePortraits, useSetMasterPortrait } from '@/hooks';
import { CharacterList } from './CharacterList';
import { CharacterForm } from './CharacterForm';
import { PortraitGallery } from './PortraitGallery';
import { ExtractCharactersModal } from './ExtractCharactersModal';
import type { 
  Character, 
  CreateCharacterInput, 
  UpdateCharacterInput,
  CharacterSuggestion 
} from '@/types';

interface CharacterStudioPanelProps {
  projectId: string;
}

type ViewMode = 'list' | 'form' | 'detail';

export const CharacterStudioPanel = ({ projectId }: CharacterStudioPanelProps) => {
  const { t } = useTranslation(['characters', 'uikit']);
  const toast = useToast();
  
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null);
  const [extractModalOpen, setExtractModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CharacterSuggestion[]>([]);

  // Queries & Mutations
  const { data: characters = [], isLoading } = useCharacters(projectId);
  const createCharacter = useCreateCharacter();
  const updateCharacter = useUpdateCharacter();
  const deleteCharacter = useDeleteCharacter();
  const extractCharacters = useExtractCharacters();
  const createFromSuggestions = useCreateFromSuggestions();
  const approveCharacter = useApproveCharacter();
  const generatePortraits = useGeneratePortraits();
  const setMasterPortrait = useSetMasterPortrait();

  // Handlers
  const handleAddNew = () => {
    setEditingCharacter(null);
    setViewMode('form');
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setViewMode('form');
  };

  const handleSelect = (character: Character) => {
    setSelectedCharacter(character);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedCharacter(null);
    setEditingCharacter(null);
  };

  const handleSave = useCallback((data: CreateCharacterInput | UpdateCharacterInput) => {
    if (editingCharacter) {
      updateCharacter.mutate(
        { id: editingCharacter.id, data: data as UpdateCharacterInput },
        {
          onSuccess: () => {
            toast.success(t('characters:messages.updated'));
            handleBack();
          },
        }
      );
    } else {
      createCharacter.mutate(data as CreateCharacterInput, {
        onSuccess: () => {
          toast.success(t('characters:messages.created'));
          handleBack();
        },
      });
    }
  }, [editingCharacter, updateCharacter, createCharacter, toast, t]);

  const handleDelete = (character: Character) => {
    setDeleteTarget(character);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteCharacter.mutate(deleteTarget.id, {
        onSuccess: () => {
          toast.success(t('characters:messages.deleted'));
          setDeleteTarget(null);
          if (selectedCharacter?.id === deleteTarget.id) {
            handleBack();
          }
        },
      });
    }
  };

  const handleExtract = () => {
    setExtractModalOpen(true);
    extractCharacters.mutate(projectId, {
      onSuccess: (result) => {
        setSuggestions(result);
        if (result.length > 0) {
          toast.success(t('characters:messages.extract_success', { count: result.length }));
        } else {
          toast.info(t('characters:messages.extract_empty'));
        }
      },
    });
  };

  const handleAddSuggestions = (selected: CharacterSuggestion[]) => {
    createFromSuggestions.mutate(
      { projectId, suggestions: selected },
      {
        onSuccess: () => {
          toast.success(t('characters:messages.created'));
          setExtractModalOpen(false);
          setSuggestions([]);
        },
      }
    );
  };

  const handleGeneratePortrait = (character: Character) => {
    setSelectedCharacter(character);
    setViewMode('detail');
    generatePortraits.mutate(character.id);
  };

  const handleSelectMaster = (portraitUrl: string) => {
    if (selectedCharacter) {
      setMasterPortrait.mutate(
        { characterId: selectedCharacter.id, portraitUrl },
        {
          onSuccess: (updated) => {
            setSelectedCharacter(updated);
            toast.success(t('characters:messages.portrait_set'));
          },
        }
      );
    }
  };

  const handleApprove = (character: Character) => {
    approveCharacter.mutate(character.id, {
      onSuccess: () => {
        toast.success(t('characters:messages.approved'));
      },
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {viewMode === 'list' ? (
          <>
            <div>
              <h3 className="font-semibold text-lg">{t('characters:panel.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('characters:panel.subtitle')}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExtract}>
                <Sparkles size={16} className="mr-1" />
                {t('characters:actions.extract')}
              </Button>
              <Button size="sm" onClick={handleAddNew}>
                <Plus size={16} className="mr-1" />
                {t('characters:actions.add')}
              </Button>
            </div>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ChevronLeft size={16} className="mr-1" />
            {t('uikit:back')}
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CharacterList
                characters={characters}
                isLoading={isLoading}
                selectedId={selectedCharacter?.id}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onGeneratePortrait={handleGeneratePortrait}
                onApprove={handleApprove}
                onExtract={handleExtract}
              />
            </motion.div>
          )}

          {viewMode === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CharacterForm
                key={editingCharacter?.id ?? 'new'}
                character={editingCharacter ?? undefined}
                projectId={projectId}
                onSave={handleSave}
                onCancel={handleBack}
                isLoading={createCharacter.isPending || updateCharacter.isPending}
              />
            </motion.div>
          )}

          {viewMode === 'detail' && selectedCharacter && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Character Info */}
              <div>
                <h4 className="font-semibold text-lg">{selectedCharacter.name}</h4>
                {selectedCharacter.description && (
                  <p className="text-muted-foreground mt-1">{selectedCharacter.description}</p>
                )}
              </div>

              {/* Portrait Gallery */}
              <PortraitGallery
                portraits={selectedCharacter.portraitOptions ?? []}
                masterPortraitUrl={selectedCharacter.masterPortraitUrl}
                onSelectMaster={handleSelectMaster}
                onRegenerate={() => { generatePortraits.mutate(selectedCharacter.id); }}
                isGenerating={generatePortraits.isPending}
                isSelectingMaster={setMasterPortrait.isPending}
              />

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => { handleEdit(selectedCharacter); }}
                >
                  {t('characters:actions.edit')}
                </Button>
                {selectedCharacter.status === 'draft' && selectedCharacter.masterPortraitUrl && (
                  <Button onClick={() => { handleApprove(selectedCharacter); }}>
                    {t('characters:actions.approve')}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Extract Modal */}
      <ExtractCharactersModal
        open={extractModalOpen}
        onOpenChange={setExtractModalOpen}
        suggestions={suggestions}
        isExtracting={extractCharacters.isPending}
        onExtract={handleExtract}
        onAddSelected={handleAddSuggestions}
        isAdding={createFromSuggestions.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onCancel={() => { setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title={t('characters:confirm.delete_title')}
        message={t('characters:confirm.delete_message', { name: deleteTarget?.name ?? '' })}
        confirmText={t('uikit:delete')}
        variant="danger"
        loading={deleteCharacter.isPending}
      />
    </div>
  );
};
