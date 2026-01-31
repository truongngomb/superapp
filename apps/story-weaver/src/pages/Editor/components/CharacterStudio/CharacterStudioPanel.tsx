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
  useToast,
  LoadingSpinner
} from '@superapp/ui-kit';
import { Plus, Sparkles, ChevronLeft, Wand2 } from 'lucide-react';
import { 
  useCharacters,
  useCharacter,
  useCreateCharacter, 
  useUpdateCharacter,
  useDeleteCharacter,
  useExtractCharacters,
  useCreateFromSuggestions,
  useVideoScenes,
  useUpdateVideoScene
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
import { type ExtendedScene } from '@/types/scene-script';

interface CharacterStudioPanelProps {
  projectId: string;
}

type ViewMode = 'list' | 'form' | 'detail';

export const CharacterStudioPanel = ({ projectId }: CharacterStudioPanelProps) => {
  const { t } = useTranslation(['characters', 'uikit']);
  const toast = useToast();
  
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null);
  const [extractModalOpen, setExtractModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CharacterSuggestion[]>([]);

  // Queries & Mutations
  const { data: characters = [], isLoading } = useCharacters(projectId);
  // Fetch full details when a character is selected
  const { data: selectedCharacter, isLoading: isLoadingDetail } = useCharacter(selectedCharacterId ?? '');

  const createCharacter = useCreateCharacter();
  const updateCharacter = useUpdateCharacter();
  const deleteCharacter = useDeleteCharacter();
  const extractCharacters = useExtractCharacters();
  const createFromSuggestions = useCreateFromSuggestions();
  const generatePortraits = useGeneratePortraits();
  const setMasterPortrait = useSetMasterPortrait();
  
  // Scenes for auto-matching
  const { scenes } = useVideoScenes(projectId);
  const updateScene = useUpdateVideoScene(projectId);
  const [isAutoMatching, setIsAutoMatching] = useState(false);

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
    setSelectedCharacterId(character.id);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedCharacterId(null);
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

  const handleAutoMatchAll = useCallback(async () => {
    if (scenes.length === 0 || characters.length === 0) return;
    
    setIsAutoMatching(true);
    let matchedCount = 0;

    try {
      const titlesToIgnore = [
        'vua', 'chúa', 'công', 'chúa', 'hoàng', 'tử', 'thần', 
        'chàng', 'nàng', 'mỵ', 'nương', 'ông', 'bà', 'anh', 'chị', 'em'
      ];

      for (const scene of (scenes as ExtendedScene[])) {
        const visualDescription = scene.visualDescription ?? scene.visualPrompt ?? '';
        const voiceover = scene.voiceover ?? scene.scriptText ?? '';
        const fullText = `${visualDescription} ${voiceover}`.toLowerCase();
        
        const matchedIds = characters
          .filter(char => {
            const name = char.name.toLowerCase();
            
            // 1. Exact full name match
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const fullRegex = new RegExp(`\\b${escapedName}\\b`, 'i');
            if (fullRegex.test(fullText)) return true;

            // 2. Significant parts match
            const nameParts = name.split(/\s+/).filter(part => 
              part.length > 2 && !titlesToIgnore.includes(part)
            );

            return nameParts.some(part => {
              const partRegex = new RegExp(`\\b${part}\\b`, 'i');
              return partRegex.test(fullText);
            });
          })
          .map(char => char.id);

        const currentIds = scene.characterIds || [];
        // Use a Set to merge and avoid duplicates
        const finalIds = Array.from(new Set([...currentIds, ...matchedIds]));

        // Only update if characterIds actually changed (checking content regardless of order)
        const isChanged = JSON.stringify([...finalIds].sort()) !== JSON.stringify([...currentIds].sort());

        if (isChanged) {
          await updateScene.mutateAsync({
            sceneId: scene.id,
            data: { characterIds: finalIds }
          });
          matchedCount++;
        }
      }

      toast.success(t('characters:messages.auto_match_success', { count: matchedCount }));
    } catch (error) {
      console.error('Auto-match failed:', error);
      toast.error(t('characters:messages.auto_match_error'));
    } finally {
      setIsAutoMatching(false);
    }
  }, [scenes, characters, updateScene, toast, t]);

  const handleDelete = (character: Character) => {
    setDeleteTarget(character);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteCharacter.mutate(deleteTarget.id, {
        onSuccess: () => {
          toast.success(t('characters:messages.deleted'));
          setDeleteTarget(null);
          if (selectedCharacterId === deleteTarget.id) {
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
    setSelectedCharacterId(character.id);
    setViewMode('detail');
    generatePortraits.mutate(character.id); // No manual state update needed, Query will refresh
  };

  const [tempMasterPortraitUrl, setTempMasterPortraitUrl] = useState<string | null>(null);

  const handleSelectMaster = (portraitUrl: string) => {
    setTempMasterPortraitUrl(portraitUrl);
  };

  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async (character: Character) => {
    setIsApproving(true);
    try {
      let currentMasterUrl = character.masterPortraitUrl;

      // 1. Upload Master Portrait (if changed)
      if (tempMasterPortraitUrl) {
        const updated = await setMasterPortrait.mutateAsync({
          characterId: character.id,
          portraitUrl: tempMasterPortraitUrl
        });
        // We use the temp url for matching options, but keep in mind the real master url changed
        currentMasterUrl = updated.masterPortraitUrl;
      }

      // 2. Update Options Selection State
      const targetUrl = tempMasterPortraitUrl || currentMasterUrl;
      // Note: portraitOptions might be partial if we didn't fetch full details, but in this function 'character' is 'selectedCharacter' which is full details
      const updatedOptions = character.portraitOptions?.map(opt => ({
        ...opt,
        isSelected: opt.url === targetUrl
      }));

      // 3. Approve & Save Options
      updateCharacter.mutate({
        id: character.id,
        data: {
          status: 'approved',
          portraitOptions: updatedOptions
        }
      }, {
        onSuccess: () => {
          // Query invalidation handles update
          setTempMasterPortraitUrl(null);
          toast.success(t('characters:messages.approved'));
          setIsApproving(false);
        },
        onError: (error) => {
          console.error('Approve failed:', error);
          toast.error(t('characters:messages.approve_error', { message: error.message }));
          setIsApproving(false);
        }
      });
    } catch (error) {
      console.error('Failed to approve character:', error);
      toast.error(t('characters:messages.approve_error', { message: 'Failed to process request' }));
      setIsApproving(false);
    }
  };

  // Resolve character to display (Basic info vs Full Detail)
  const selectedCharacterBasic = characters.find(c => c.id === selectedCharacterId);
  const displayCharacter = selectedCharacter || selectedCharacterBasic;

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className={`flex mb-4 ${viewMode === 'list' ? 'flex-col gap-4 items-start' : 'items-center justify-between'}`}>
        {viewMode === 'list' ? (
          <>
            <div>
              <h3 className="font-semibold text-lg">{t('characters:panel.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('characters:panel.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full">
              <Button variant="outline" size="sm" onClick={handleExtract} className="flex-1">
                <Sparkles size={16} className="mr-1" />
                {t('characters:actions.extract')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { void handleAutoMatchAll(); }} 
                className="flex-1"
                loading={isAutoMatching}
                disabled={isAutoMatching || scenes.length === 0 || characters.length === 0}
              >
                <Wand2 size={16} className="mr-1" />
                {t('characters:actions.auto_match_all')}
              </Button>
              <Button size="sm" onClick={handleAddNew} className="flex-1">
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
                selectedId={selectedCharacterId ?? undefined}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onGeneratePortrait={handleGeneratePortrait}
                onApprove={void handleApprove}
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

          {viewMode === 'detail' && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {!displayCharacter ? (
                 <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" />
                 </div>
              ) : (
                <>
                  {/* Character Info */}
                  <div>
                    <h4 className="font-semibold text-lg">{displayCharacter.name}</h4>
                    {displayCharacter.description && (
                      <p className="text-muted-foreground mt-1">{displayCharacter.description}</p>
                    )}
                  </div>

                  {/* Portrait Gallery */}
                  <PortraitGallery
                    portraits={displayCharacter.portraitOptions ?? []}
                    masterPortraitUrl={tempMasterPortraitUrl || displayCharacter.masterPortraitUrl}
                    onSelectMaster={handleSelectMaster}
                    onRegenerate={() => { 
                      generatePortraits.mutate(displayCharacter.id); 
                    }}
                    isGenerating={generatePortraits.isPending}
                    isSelectingMaster={false} 
                    isLoading={isLoadingDetail && !selectedCharacter}
                  />

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      onClick={() => { handleEdit(displayCharacter); }}
                      disabled={isApproving}
                    >
                      {t('characters:actions.edit')}
                    </Button>
                    {(displayCharacter.status === 'draft' || tempMasterPortraitUrl) && (
                      <Button 
                        onClick={() => { void handleApprove(displayCharacter); }}
                        loading={isApproving}
                      >
                        {displayCharacter.status === 'approved' 
                          ? t('characters:actions.save_portrait') 
                          : t('characters:actions.approve')}
                      </Button>
                    )}
                  </div>
                </>
              )}
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
