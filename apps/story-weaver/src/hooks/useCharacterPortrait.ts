/**
 * useCharacterPortrait Hook
 * 
 * React Query hook for managing character portrait generation.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@superapp/ui-kit';
import { characterService } from '@/services';
import { characterKeys } from './useCharacters';

/**
 * Hook to generate portrait options for a character
 */
export function useGeneratePortraits() {
  const queryClient = useQueryClient();
  const { t } = useTranslation(['characters']);
  const toast = useToast();
  
  return useMutation({
    mutationFn: (characterId: string) => characterService.generatePortraits(characterId),
    onSuccess: (_, characterId) => {
      void queryClient.invalidateQueries({ 
        queryKey: characterKeys.detail(characterId) 
      });
      // Also invalidate the list to ensure thumbnails update if we want that
      void queryClient.invalidateQueries({ 
          queryKey: characterKeys.all
      });
      toast.success(t('characters:messages.portraits_generated', { defaultValue: 'Portraits generated successfully' }));
    },
    onError: (error) => {
      console.error('Portrait generation failed:', error);
      toast.error(t('characters:messages.generation_failed', { defaultValue: 'Failed to generate portraits. Please check AI settings.' }));
    },
  });
}

/**
 * Hook to set master portrait for a character
 */
export function useSetMasterPortrait() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ characterId, portraitUrl }: { characterId: string; portraitUrl: string }) => 
      characterService.setMasterPortrait(characterId, portraitUrl),
    onSuccess: (character) => {
      void queryClient.invalidateQueries({ 
        queryKey: characterKeys.detail(character.id) 
      });
      void queryClient.invalidateQueries({ 
        queryKey: characterKeys.byProject(character.projectId) 
      });
    },
  });
}
