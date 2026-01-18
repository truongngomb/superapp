/**
 * Category Service
 * 
 * Handles CRUD operations for categories with soft delete support.
 * Extends BaseService for all common operations.
 */
import { BaseService } from './base.service.js';
import { Collections, CacheKeys } from '../config/index.js';
import type { Category } from '@superapp/shared-types';

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * Service for managing categories with soft delete support
 * Uses BaseService soft delete feature
 */
class CategoryService extends BaseService<Category> {
  protected readonly collectionName = Collections.CATEGORIES;
  protected readonly cacheKey = CacheKeys.CATEGORIES;

  /** Exclude soft-deleted records by default */
  protected readonly defaultFilter = 'isDeleted = false';

  protected mapRecord(record: Record<string, unknown>): Category {
    return {
      id: record['id'] as string,
      name: record['name'] as string,
      description: (record['description'] as string) || '',
      color: (record['color'] as string) || '#3b82f6',
      icon: (record['icon'] as string) || 'folder',
      isActive: record['isActive'] as boolean,
      isDeleted: (record['isDeleted'] as boolean) || false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const categoryService = new CategoryService();
