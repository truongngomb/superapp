/**
 * Category Service
 * 
 * Handles CRUD operations for categories with soft delete support.
 */
import { BaseService, type ListOptions, type PaginatedResult } from './base.service.js';
import { Collections, CacheKeys, pb, getOrSet } from '../config/index.js';
import type { Category } from '../types/index.js';

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * Service for managing categories with soft delete support
 */
class CategoryService extends BaseService<Category> {
  protected readonly collectionName = Collections.CATEGORIES;
  protected readonly cacheKey = CacheKeys.CATEGORIES;

  /** Filter condition to exclude soft-deleted records */
  private readonly activeFilter = 'isDeleted = false';

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

  /**
   * Get all categories (excludes soft-deleted)
   */
  async getAll(): Promise<Category[]> {
    return getOrSet(
      this.cacheKey,
      async () => {
        await this.ensureDbAvailable();
        const records = await pb.collection(this.collectionName).getFullList({
          sort: '-created',
          filter: this.activeFilter,
        });
        return records.map((r) => this.mapRecord(r));
      },
      this.cacheTtl
    );
  }

  /**
   * Get paginated categories (excludes soft-deleted)
   */
  async getPage(options: ListOptions = {}): Promise<PaginatedResult<Category>> {
    const { filter } = options;
    
    // Merge user filter with activeFilter
    const combinedFilter = filter 
      ? `(${filter}) && ${this.activeFilter}`
      : this.activeFilter;

    return super.getPage({ ...options, filter: combinedFilter });
  }

  /**
   * Soft delete category (sets isDeleted = true instead of removing)
   */
  async delete(id: string, actorId?: string): Promise<void> {
    await this.ensureDbAvailable();

    // Use update to set isDeleted = true (soft delete)
    await pb.collection(this.collectionName).update(id, { isDeleted: true });
    this.invalidateCache();

    this.log.info('Soft deleted record', { id });

    // Log activity
    const { activityLogService } = await import('./activity_log.service.js');
    void activityLogService.logCRUD(actorId, 'delete', this.collectionName, id);
  }
}

// =============================================================================
// Export Singleton
// =============================================================================

export const categoryService = new CategoryService();

