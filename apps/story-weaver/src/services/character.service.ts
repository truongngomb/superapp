/**
 * Character Service
 * 
 * Handles Character CRUD and AI-related operations.
 */
import { BaseService } from '@superapp/core-logic';
import { API_ENDPOINTS, api } from '@/config';
import type { 
  Character,
  CharacterSuggestion,
  PortraitOption
} from '@/types';

class CharacterService extends BaseService<Character> {
  protected get endpoint(): string {
    return API_ENDPOINTS.CHARACTERS;
  }

  /**
   * Get all characters for a specific project
   */
  async getByProject(projectId: string): Promise<Character[]> {
    const response = await api.get<Character[]>(`${this.endpoint}?projectId=${projectId}`);
    return response;
  }

  /**
   * Extract characters from project story using AI
   */
  async extractCharacters(projectId: string): Promise<CharacterSuggestion[]> {
    const response = await api.post<{ characters: CharacterSuggestion[] }>(
      `${API_ENDPOINTS.GENERATION}/characters/extract`,
      { projectId }
    );
    return response.characters;
  }

  /**
   * Generate portrait options for a character using AI
   */
  async generatePortraits(characterId: string): Promise<PortraitOption[]> {
    const response = await api.post<{ portraits: PortraitOption[] }>(
      `${API_ENDPOINTS.GENERATION}/portraits`,
      { characterId }
    );
    return response.portraits;
  }

  /**
   * Set master portrait for a character
   */
  async setMasterPortrait(characterId: string, portraitUrl: string): Promise<Character> {
    const response = await api.patch<Character>(
      `${this.endpoint}/${characterId}`,
      { masterPortraitUrl: portraitUrl }
    );
    return response;
  }

  /**
   * Approve character (mark as ready for use in scenes)
   */
  async approveCharacter(characterId: string): Promise<Character> {
    const response = await api.patch<Character>(
      `${this.endpoint}/${characterId}`,
      { status: 'approved' }
    );
    return response;
  }

  /**
   * Bulk create characters from suggestions
   */
  async createFromSuggestions(projectId: string, suggestions: CharacterSuggestion[]): Promise<Character[]> {
    const created: Character[] = [];
    for (const suggestion of suggestions) {
      const char = await this.create({
        projectId,
        name: suggestion.name,
        description: suggestion.description,
      });
      created.push(char);
    }
    return created;
  }
}

export const characterService = new CharacterService();
