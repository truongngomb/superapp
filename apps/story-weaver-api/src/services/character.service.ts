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
}

export const characterService = new CharacterService();
