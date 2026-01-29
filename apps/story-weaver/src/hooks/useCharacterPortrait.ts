/**
 * useCharacterPortrait Hook
 * 
 * React Query hook for managing character portrait generation.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { characterService } from '@/services';
import { characterKeys } from './useCharacters';

/**
 * Hook to generate portrait options for a character
 */
export function useGeneratePortraits() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (characterId: string) => characterService.generatePortraits(characterId),
    onSuccess: (_, characterId) => {
      void queryClient.invalidateQueries({ 
        queryKey: characterKeys.detail(characterId) 
      });
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
