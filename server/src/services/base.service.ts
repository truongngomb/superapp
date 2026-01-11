/**
 * Base Service
 * 
 * Abstract base class for PocketBase collection services.
 * Provides CRUD operations with caching, soft delete support, and batch operations.
 */
import { adminPb, getOrSet, invalidate, checkPocketBaseHealth, ensureAdminAuth, config } from '../config/index.js';
import { NotFoundError, ServiceUnavailableError } from '../middleware/index.js';
import { createLogger } from '../utils/index.js';
import type { MinimalEntity } from '../types/index.js';

// =============================================================================
// Types
// =============================================================================

/** Options for list operations */
export interface ListOptions {
  /** Page number (1-indexed) */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Sort field */
  sort?: string;
  /** Sort order */
  order?: 'asc' | 'desc';
  /** Filter expression */
  filter?: string;
  /** Expand relations */
  expand?: string;
}

/** Paginated result */
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =============================================================================
// Base Service Class
// =============================================================================

/**
 * Abstract base service for PocketBase collections
 * 
 * @template T - Entity type (must extend MinimalEntity)
 * 
 * Features:
 * - CRUD operations with caching
 * - Optional soft delete support
 * - Batch operations (deleteMany, updateMany)
 * - Default filter support
 * - Activity logging
 * 
 * @example
 * ```typescript
 * class CategoryService extends BaseService<Category> {
 *   protected collectionName = 'categories';
 *   protected cacheKey = 'categories';
 *   protected softDelete = true;
 *   protected defaultFilter = 'isDeleted = false';
 *   
 *   protected mapRecord(record: Record<string, unknown>): Category {
 *     return { id: record.id, name: record.name, ... };
 *   }
 * }
 * ```
 */
export abstract class BaseService<T extends MinimalEntity> {
  /** PocketBase collection name */
  protected abstract readonly collectionName: string;
  
  /** Cache key prefix */
  protected abstract readonly cacheKey: string;
  
  /** Cache TTL in seconds (default: 5 minutes) */
  protected cacheTtl = config.cache.defaultTtl;

  /** Default filter to apply to all queries (e.g., 'isDeleted = false') */
  protected readonly defaultFilter?: string;

  /** Default expand for relations (e.g., 'user' or 'user,category'). Empty = no expand */
  protected readonly defaultExpand?: string;

  /** Scoped logger for this service */
  protected readonly log = createLogger(this.constructor.name);

  /** Access to PocketBase client (authenticated as admin) */
  protected get db() {
    return adminPb;
  }

  /** Shorthand for db.collection(this.collectionName) */
  protected get collection() {
    return this.db.collection(this.collectionName);
  }

  // ===========================================================================
  // Abstract Methods
  // ===========================================================================

  /**
   * Map PocketBase record to domain entity
   * Must be implemented by subclasses
   */
  protected abstract mapRecord(record: Record<string, unknown>): T;

  // ===========================================================================
  // Read Operations
  // ===========================================================================

  /**
   * Get all records (cached), sorted by created date descending
   * Applies defaultFilter if defined
   */
  async getAll(): Promise<T[]> {
    return getOrSet(
      this.cacheKey,
      async () => {
        await this.ensureDbAvailable();
        const records = await this.collection.getFullList({
          sort: '-created',
          filter: this.defaultFilter || '',
          expand: this.defaultExpand || '',
        });
        return records.map((r) => this.mapRecord(r));
      },
      this.cacheTtl
    );
  }

  /**
   * Get all records with custom filter and sort (no cache, for export)
   * @param options - Filter and sort options
   */
  async getAllFiltered(options: Omit<ListOptions, 'page' | 'limit'> = {}): Promise<T[]> {
    const { sort, order = 'desc', filter, expand } = options;
    
    await this.ensureDbAvailable();
    
    const sortStr = sort ? `${order === 'desc' ? '-' : ''}${sort}` : '-created';
    const records = await this.collection.getFullList({
      sort: sortStr,
      filter: this.combineFilters(filter),
      expand: expand || this.defaultExpand || '',
    });
    
    return records.map((r) => this.mapRecord(r));
  }

  /**
   * Get paginated records
   * Combines defaultFilter with user filter
   */
  async getPage(options: ListOptions = {}): Promise<PaginatedResult<T>> {
    const { page = 1, limit = config.itemsPerPage, sort, order = 'asc', filter, expand } = options;
    
    await this.ensureDbAvailable();
    
    const sortStr = sort ? `${order === 'desc' ? '-' : ''}${sort}` : '-created';
    const result = await this.collection.getList(page, limit, {
      sort: sortStr,
      filter: this.combineFilters(filter),
      expand: expand || this.defaultExpand || '',
    });

    return {
      items: result.items.map((r) => this.mapRecord(r)),
      page: result.page,
      limit: result.perPage,
      total: result.totalItems,
      totalPages: result.totalPages,
    };
  }

  /**
   * Get record by ID
   * 
   * @throws NotFoundError if record doesn't exist
   */
  async getById(id: string): Promise<T> {
    await this.ensureDbAvailable();
    
    try {
      const record = await this.collection.getOne(id);
      return this.mapRecord(record);
    } catch {
      throw new NotFoundError(`${this.collectionName} with id '${id}' not found`);
    }
  }

  /**
   * Get first record matching a field value
   * 
   * @returns Record or null if not found
   */
  async getFirstByField(field: string, value: unknown): Promise<T | null> {
    await this.ensureDbAvailable();
    
    try {
      let filterStr: string;
      if (typeof value === 'string') {
        // Escape special characters to prevent filter injection
        const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        filterStr = `${field} = "${escaped}"`;
      } else {
        filterStr = `${field} = ${String(value)}`;
      }
      
      const record = await this.collection.getFirstListItem(this.combineFilters(filterStr));
      return this.mapRecord(record);
    } catch {
      return null;
    }
  }

  /**
   * Check if record exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      await this.getById(id);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Count records matching filter
   */
  async count(filter?: string): Promise<number> {
    await this.ensureDbAvailable();
    const result = await this.collection.getList(1, 1, { filter: this.combineFilters(filter) });
    return result.totalItems;
  }

  // ===========================================================================
  // Write Operations
  // ===========================================================================

  /**
   * Create new record
   * @param input - Data to create
   * @param actorId - User performing the action (for logging)
   * @param skipLog - Skip activity logging (use for ActivityLogService to avoid infinite loop)
   */
  async create(input: Partial<Omit<T, keyof MinimalEntity>>, actorId?: string, skipLog = false): Promise<T> {
    await this.ensureDbAvailable();
    const record = await this.collection.create(input);
    this.invalidateCache();
    this.log.info('Created record', { id: record.id });
    if (!skipLog) this.logActivity(actorId, 'create', record.id, { data: input });
    return this.mapRecord(record);
  }

  /**
   * Update existing record
   * @param skipLog - Skip activity logging
   * @throws NotFoundError if record doesn't exist
   */
  async update(id: string, input: Partial<Omit<T, keyof MinimalEntity>>, actorId?: string, skipLog = false): Promise<T> {
    await this.ensureDbAvailable();
    
    try {
      const record = await this.collection.update(id, input);
      this.invalidateCache();
      this.log.info('Updated record', { id });
      if (!skipLog) this.logActivity(actorId, 'update', id, { data: input });
      return this.mapRecord(record);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new NotFoundError(`${this.collectionName} with id '${id}' not found`);
    }
  }

  /**
   * Update multiple records in parallel
   */
  async updateMany(ids: string[], input: Partial<Omit<T, keyof MinimalEntity>>, actorId?: string): Promise<void> {
    await this.ensureDbAvailable();
    await Promise.all(ids.map(async (id) => {
      await this.collection.update(id, input);
      this.logActivity(actorId, 'update', id, { data: input });
    }));
    this.invalidateCache();
    this.log.info('Batch updated records', { count: ids.length, ids });
  }

  /**
   * Soft delete record (set isDeleted = true)
   * Record remains in database but excluded by defaultFilter
   * @param skipLog - Skip activity logging
   */
  async delete(id: string, actorId?: string, skipLog = false): Promise<void> {
    await this.ensureDbAvailable();
    await this.collection.update(id, { isDeleted: true });
    this.invalidateCache();
    this.log.info('Soft deleted record', { id });
    if (!skipLog) this.logActivity(actorId, 'delete', id);
  }

  /**
   * Hard delete record (permanently remove from database)
   * @throws NotFoundError if record doesn't exist
   */
  async hardDelete(id: string, actorId?: string): Promise<void> {
    await this.ensureDbAvailable();
    try {
      await this.collection.delete(id);
      this.invalidateCache();
      this.log.info('Hard deleted record', { id });
      this.logActivity(actorId, 'delete', id, { permanent: true });
    } catch {
      throw new NotFoundError(`${this.collectionName} with id '${id}' not found`);
    }
  }

  /**
   * Soft delete multiple records in parallel
   */
  async deleteMany(ids: string[], actorId?: string): Promise<void> {
    await this.ensureDbAvailable();
    await Promise.all(ids.map(async (id) => {
      await this.collection.update(id, { isDeleted: true });
      this.logActivity(actorId, 'delete', id);
    }));
    this.invalidateCache();
    this.log.info('Batch soft deleted records', { count: ids.length, ids });
  }

  /**
   * Hard delete multiple records in parallel
   */
  async hardDeleteMany(ids: string[], actorId?: string): Promise<void> {
    await this.ensureDbAvailable();
    await Promise.all(ids.map(async (id) => {
      await this.collection.delete(id);
      this.logActivity(actorId, 'delete', id, { permanent: true });
    }));
    this.invalidateCache();
    this.log.info('Batch hard deleted records', { count: ids.length, ids });
  }

  /**
   * Restore soft-deleted record
   */
  async restore(id: string, actorId?: string): Promise<void> {
    await this.ensureDbAvailable();
    await this.collection.update(id, { isDeleted: false });
    this.invalidateCache();
    this.log.info('Restored soft-deleted record', { id });
    this.logActivity(actorId, 'update', id, { restore: true });
  }

  /**
   * Restore multiple soft-deleted records in parallel
   */
  async restoreMany(ids: string[], actorId?: string): Promise<void> {
    await this.ensureDbAvailable();
    await Promise.all(ids.map(async (id) => {
      await this.collection.update(id, { isDeleted: false });
      this.logActivity(actorId, 'update', id, { restore: true });
    }));
    this.invalidateCache();
    this.log.info('Batch restored records', { count: ids.length, ids });
  }


  /**
   * Log activity (fire-and-forget)
   * Uses dynamic import to avoid circular dependency
   */
  protected logActivity(
    actorId: string | undefined,
    action: 'create' | 'update' | 'delete',
    recordId: string,
    details?: Record<string, unknown>
  ): void {
    void (async () => {
      const { activityLogService } = await import('./activity_log.service.js');
      await activityLogService.logCRUD(actorId, action, this.collectionName, recordId, details);
    })();
  }

  /**
   * Combine user filter with default filter
   */
  protected combineFilters(userFilter?: string): string {
    if (!this.defaultFilter) {
      return userFilter || '';
    }
    
    if (!userFilter) {
      return this.defaultFilter;
    }
    
    // Check if user filter already contains the default filter field
    // to avoid duplicate conditions
    const defaultField = this.defaultFilter.split('=')[0]?.trim();
    if (defaultField && userFilter.includes(defaultField)) {
      return userFilter;
    }
    
    return `(${userFilter}) && ${this.defaultFilter}`;
  }

  /**
   * Ensure database is available
   * @throws ServiceUnavailableError if database is unavailable
   */
  protected async ensureDbAvailable(): Promise<void> {
    const available = await checkPocketBaseHealth();
    if (!available) {
      throw new ServiceUnavailableError('Database is currently unavailable');
    }
    // Ensure adminPb is authenticated as superuser
    await ensureAdminAuth();
  }

  /**
   * Invalidate cache for this collection
   */
  protected invalidateCache(): void {
    invalidate(this.cacheKey);
  }
}

