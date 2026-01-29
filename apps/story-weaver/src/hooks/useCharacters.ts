/**
 * useCharacters Hook
 * 
 * React Query hook for managing characters in a project.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { characterService } from '@/services';
import type {
  CreateCharacterInput, 
  UpdateCharacterInput,
  CharacterSuggestion
} from '@/types';

// Query Keys
export const characterKeys = {
  all: ['characters'] as const,
  byProject: (projectId: string) => [...characterKeys.all, 'project', projectId] as const,
  detail: (id: string) => [...characterKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch characters for a project
 */
export function useCharacters(projectId: string) {
  return useQuery({
    queryKey: characterKeys.byProject(projectId),
    queryFn: () => characterService.getByProject(projectId),
    enabled: !!projectId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to get a single character
 */
export function useCharacter(characterId: string) {
  return useQuery({
    queryKey: characterKeys.detail(characterId),
    queryFn: () => characterService.getById(characterId),
    enabled: !!characterId,
  });
}

/**
 * Hook to create a character
 */
export function useCreateCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateCharacterInput) => characterService.create(input),
    onSuccess: (newCharacter) => {
      void queryClient.invalidateQueries({ 
        queryKey: characterKeys.byProject(newCharacter.projectId) 
      });
    },
  });
}

/**
 * Hook to update a character
 */
export function useUpdateCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCharacterInput }) => 
      characterService.update(id, data),
    onSuccess: (updatedCharacter) => {
      void queryClient.invalidateQueries({ 
        queryKey: characterKeys.detail(updatedCharacter.id) 
      });
      void queryClient.invalidateQueries({ 
        queryKey: characterKeys.byProject(updatedCharacter.projectId) 
      });
    },
  });
}

/**
 * Hook to delete a character
 */
export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (characterId: string) => characterService.delete(characterId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: characterKeys.all });
    },
  });
}

/**
 * Hook to extract characters from story using AI
 */
export function useExtractCharacters() {
  return useMutation({
    mutationFn: (projectId: string) => characterService.extractCharacters(projectId),
  });
}

/**
 * Hook to create characters from AI suggestions
 */
export function useCreateFromSuggestions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, suggestions }: { projectId: string; suggestions: CharacterSuggestion[] }) => 
      characterService.createFromSuggestions(projectId, suggestions),
    onSuccess: (characters) => {
      const firstChar = characters[0];
      if (firstChar) {
        void queryClient.invalidateQueries({ 
          queryKey: characterKeys.byProject(firstChar.projectId) 
        });
      }
    },
  });
}

/**
 * Hook to approve a character
 */
export function useApproveCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (characterId: string) => characterService.approveCharacter(characterId),
    onSuccess: (character) => {
      void queryClient.invalidateQueries({ 
        queryKey: characterKeys.byProject(character.projectId) 
      });
    },
  });
}
