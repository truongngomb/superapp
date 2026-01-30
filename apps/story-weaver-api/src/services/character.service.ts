/**
 * Character Service
 * 
 * Handles CRUD operations for characters using BaseService.
 */
import { BaseService } from './base.service.js';
import { config } from '../config/index.js';
import type { Character } from '../types/character.js';

class CharacterService extends BaseService<Character> {
  protected readonly collectionName = 'sw_characters';
  protected readonly cacheKey = 'sw_characters';
  
  // Default filter: only not deleted
  protected readonly defaultFilter = 'isDeleted = false';

  protected mapRecord(record: Record<string, unknown>): Character {
    return {
      id: record['id'] as string,
      projectId: record['projectId'] as string,
      userId: record['userId'] as string,
      name: (record['name'] as string) || '',
      description: (record['description'] as string) || '',
      visualTraits: (record['visualTraits'] as string) || '',
      masterPortraitUrl: (record['masterPortrait'] ? `${config.pocketbaseUrl}/api/files/${this.collectionName}/${record['id']}/${record['masterPortrait']}` : ''),
      portraitOptions: (record['portraitOptions'] as Character['portraitOptions']) || [],
      status: (record['status'] as Character['status']) || 'draft',
      version: (record['version'] as number) || 1,
      isActive: (record['isActive'] as boolean) ?? true,
      isDeleted: (record['isDeleted'] as boolean) || false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  protected override mapToRecord(input: Partial<Character>): Record<string, unknown> {
    const record: Record<string, unknown> = {};

    if (input.projectId !== undefined) record['projectId'] = input.projectId;
    if (input.userId !== undefined) record['userId'] = input.userId;
    if (input.name !== undefined) record['name'] = input.name;
    if (input.description !== undefined) record['description'] = input.description;
    if (input.visualTraits !== undefined) record['visualTraits'] = input.visualTraits;
    // masterPortrait is handled separately if it's a file, ensure masterPortraitUrl is NOT in data
    // if (input.masterPortraitUrl !== undefined) record['masterPortraitUrl'] = input.masterPortraitUrl;
    if (input.portraitOptions !== undefined) record['portraitOptions'] = input.portraitOptions;
    if (input.status !== undefined) record['status'] = input.status;
    if (input.version !== undefined) record['version'] = input.version;
    if (input.isActive !== undefined) record['isActive'] = input.isActive;
    if (input.isDeleted !== undefined) record['isDeleted'] = input.isDeleted;

    return record;
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
  async update(id: string, input: Partial<Character>, _actorId?: string, skipLog = false): Promise<Character> {
    await this.ensureDbAvailable();
    
    try {
      this.log.info('Updating character', { id, inputKeys: Object.keys(input) });
      const data: Record<string, unknown> = this.mapToRecord(input);
      this.log.info('Mapped data for update', { id, data });

      // Handle masterPortraitUrl if it's a Base64 string (convert to file upload)
      if (input.masterPortraitUrl && input.masterPortraitUrl.startsWith('data:')) {
        // Matches standard base64 pattern: data:[<mediatype>][;base64],<data>
        const matches = input.masterPortraitUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        let contentType = 'image/png';
        let base64Data = '';

        if (matches && matches.length === 3) {
           contentType = matches[1] || 'image/png';
           base64Data = matches[2] || '';
        } else {
           // Fallback for cases where regex might fail or format is slightly different but still base64
           const parts = input.masterPortraitUrl.split(',');
           if (parts.length > 1) {
              const meta = parts[0];
              base64Data = parts[1] || '';
              if (meta) {
                 const mimeMatch = meta.match(/data:([^;]+)/);
                 if (mimeMatch && mimeMatch[1]) {
                    contentType = mimeMatch[1];
                 }
              }
           }
        }
        if (base64Data) {
          // Convert base64 to Uint8Array (more compatible than Buffer for File/Blob)
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Determine extension from content type
          const ext = contentType.split('/')[1]?.split('+')[0] || 'png';
          const filename = `portrait_${Date.now()}.${ext}`;
          
          const blob = new Blob([bytes], { type: contentType });
          const uploadData = {
            ...data,
            masterPortrait: new File([blob], filename, { type: contentType }),
          };
          
          const record = await this.collection.update(id, uploadData);
          this.invalidateCache();
          if (!skipLog) this.log.info('Updated record with file', { id });
          return this.mapRecord(record);
        }
      }

      const record = await this.collection.update(id, data);
      this.invalidateCache();
      if (!skipLog) this.log.info('Updated record', { id });
      return this.mapRecord(record);
    } catch (error) {
      if ((error as { status?: number }).status === 404) {
        throw new Error(`${this.collectionName} with id '${id}' not found`);
      }
      throw error;
    }
  }
}

export const characterService = new CharacterService();
