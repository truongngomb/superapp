/**
 * Category Service
 * 
 * Handles CRUD operations for categories.
 */
import { BaseService } from './baseService.js';
import { Collections, CacheKeys } from '../config/index.js';
import type { Category } from '../types/index.js';

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * Service for managing categories
 */
class CategoryService extends BaseService<Category> {
  protected readonly collectionName = Collections.CATEGORIES;
  protected readonly cacheKey = CacheKeys.CATEGORIES;

  protected mapRecord(record: Record<string, unknown>): Category {
    return {
      id: record['id'] as string,
      name: record['name'] as string,
      description: (record['description'] as string) || '',
      color: (record['color'] as string) || '#3b82f6',
      icon: (record['icon'] as string) || 'folder',
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const categoryService = new CategoryService();
