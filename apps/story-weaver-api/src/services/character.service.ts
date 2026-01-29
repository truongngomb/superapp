/**
 * Character Service
 * 
 * Handles CRUD operations for characters using BaseService.
 */
import { BaseService } from './base.service.js';
import type { Character } from '../types/character.js';


class CharacterService extends BaseService<Character> {
  protected readonly collectionName = 'sw_characters';
  protected readonly cacheKey = 'sw_characters';
  
  // Default filter: only not deleted
  protected readonly defaultFilter = 'isDeleted = false';

  protected mapRecord(record: Record<string, unknown>): Character {
    return {
      id: record['id'] as string,
      projectId: record['project_id'] as string,
      userId: record['user_id'] as string,
      name: record['name'] as string,
      description: (record['description'] as string) || '',
      visualTraits: (record['visual_traits'] as string) || '',
      masterPortraitUrl: (record['master_portrait_url'] as string) || undefined,
      portraitOptions: (record['portrait_options'] as Character['portraitOptions']) || [],
      status: record['status'] as Character['status'],
      version: (record['version'] as number) || 1,
      isActive: (record['isActive'] as boolean) ?? true,
      isDeleted: (record['isDeleted'] as boolean) || false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }
  /**
   * Extract characters from story content using AI
   * 
   * Uses Gemini Pro High for deep understanding of the story context.
   */
  async extractFromStory(story: string): Promise<Partial<Character>[]> {
    if (!story || story.trim().length < 10) {
      throw new Error('Story content is too short to analyze');
    }

    const { aiTextService } = await import('./ai-text.service.js');
    const { EXTRACT_CHARACTERS_SYSTEM_PROMPT, EXTRACT_CHARACTERS_USER_PROMPT } = await import('../prompts/extract-characters.prompt.js');
    const { AI_TEXT_MODELS } = await import('../config/ai.config.js');

    try {
      const result = await aiTextService.generateJSON<Partial<Character>[]>(
        EXTRACT_CHARACTERS_USER_PROMPT(story),
        {
          model: AI_TEXT_MODELS.GEMINI_3_PRO_HIGH, // Use High Intelligence model
          systemPrompt: EXTRACT_CHARACTERS_SYSTEM_PROMPT,
          temperature: 0.7, // Balance between creativity and accuracy
          maxTokens: 4000,
        }
      );

      // Post-processing: Validate and clean up result
      if (!Array.isArray(result)) {
        throw new Error('AI response is not a valid array');
      }

      return result.map(char => ({
        name: char.name || 'Unknown Character',
        description: char.description || '',
        visualTraits: char.visualTraits || '',
        portraitOptions: [],
        status: 'draft',
        version: 1,
        isActive: true,
        isDeleted: false,
      }));

    } catch (error) {
      console.error('Character Extraction Failed:', error);
      throw new Error(`Failed to extract characters: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export const characterService = new CharacterService();
