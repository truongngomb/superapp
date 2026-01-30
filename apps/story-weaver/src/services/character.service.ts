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

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class CharacterService extends BaseService<Character> {
  protected get endpoint(): string {
    return API_ENDPOINTS.CHARACTERS;
  }

  /**
   * Get all characters for a specific project
   */
  async getByProject(projectId: string): Promise<Character[]> {
    type ResponseType = PaginatedResponse<Character> | Character[];
    
    // API client automatically unwraps { success, data }
    // So we expect either PaginatedResponse or Character[]
    const response = await api.get<ResponseType>(`${this.endpoint}/by-project/${projectId}`);
    
    if (Array.isArray(response)) {
      return response;
    }

    if ('items' in response && Array.isArray(response.items)) {
      return response.items;
    }

    return [];
  }

  /**
   * Extract characters from project story using AI
   */
  async extractCharacters(projectId: string): Promise<CharacterSuggestion[]> {
    interface RawCharacterSuggestion {
      name?: string;
      Name?: string;
      description?: string;
      Description?: string;
      visualTraits?: string;
      VisualTraits?: string;
      'Visual Traits'?: string;
      visual_traits?: string;
      confidence?: number;
    }

    type RawResponse = RawCharacterSuggestion[] | { characters: RawCharacterSuggestion[] } | { data: RawCharacterSuggestion[] };

    const response = await api.post<RawResponse>(
      `${API_ENDPOINTS.GENERATION}/extract-characters/${projectId}`
    );
    
    let rawSuggestions: RawCharacterSuggestion[] = [];
    if (Array.isArray(response)) {
      rawSuggestions = response;
    } else {
      if ('characters' in response && Array.isArray(response.characters)) {
        rawSuggestions = response.characters;
      } else if ('data' in response && Array.isArray(response.data)) {
        rawSuggestions = response.data;
      }
    }
    
    return rawSuggestions.map(s => ({
      name: s.name || s.Name || '',
      description: s.description || s.Description || '',
      visualTraits: s.visualTraits || s.VisualTraits || s['Visual Traits'] || s.visual_traits || '',
      confidence: typeof s.confidence === 'number' ? s.confidence : undefined,
    }));
  }

  /**
   * Generate portrait options for a character using AI
   */
  async generatePortraits(characterId: string): Promise<PortraitOption[]> {
    // API unwraps success envelope, so we get the data payload directly
    // Controller returns { success: true, data: options }
    // API returns options (PortraitOption[])
    const response = await api.post<PortraitOption[]>(
      `${API_ENDPOINTS.GENERATION}/generate-portraits/${characterId}`
    );
    
    if (Array.isArray(response)) return response;
    return [];
  }

  /**
   * Set master portrait for a character
   */
  async setMasterPortrait(characterId: string, portraitUrl: string): Promise<Character> {
    const response = await api.put<Character>(
      `${this.endpoint}/${characterId}`,
      { masterPortraitUrl: portraitUrl }
    );
    return response;
  }

  /**
   * Approve character (mark as ready for use in scenes)
   */
  async approveCharacter(characterId: string): Promise<Character> {
    const response = await api.put<Character>(
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
        visualTraits: suggestion.visualTraits,
      });
      created.push(char);
    }
    return created;
  }
}

export const characterService = new CharacterService();
