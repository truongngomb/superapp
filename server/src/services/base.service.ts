/**
 * Base Service
 * 
 * Abstract base class for PocketBase collection services.
 * Provides CRUD operations with caching and error handling.
 */
import { pb, getOrSet, invalidate, checkPocketBaseHealth, config } from '../config/index.js';
import { NotFoundError, ServiceUnavailableError } from '../middleware/index.js';
import { createLogger } from '../utils/index.js';
import type { BaseEntity } from '../types/index.js';

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
 * @template T - Entity type (must extend BaseEntity)
 * 
 * @example
 * ```typescript
 * class UserService extends BaseService<User> {
 *   protected collectionName = 'users';
 *   protected cacheKey = 'users';
 *   
 *   protected mapRecord(record: Record<string, unknown>): User {
 *     return { id: record.id, name: record.name, ... };
 *   }
 * }
 * ```
 */
export abstract class BaseService<T extends BaseEntity> {
  /** PocketBase collection name */
  protected abstract readonly collectionName: string;
  
  /** Cache key prefix */
  protected abstract readonly cacheKey: string;
  
  /** Cache TTL in seconds (default: 5 minutes) */
  protected cacheTtl = 300;

  /** Scoped logger for this service */
  protected readonly log = createLogger(this.constructor.name);

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
   */
  async getAll(): Promise<T[]> {
    return getOrSet(
      this.cacheKey,
      async () => {
        await this.ensureDbAvailable();
        const records = await pb.collection(this.collectionName).getFullList({
          sort: '-created', // Default sort by newest first
        });
        return records.map((r) => this.mapRecord(r));
      },
      this.cacheTtl
    );
  }

  /**
   * Get paginated records
   */
  async getPage(options: ListOptions = {}): Promise<PaginatedResult<T>> {
    const { page = 1, limit = config.itemsPerPage, sort, order = 'asc', filter } = options;
    
    await this.ensureDbAvailable();
    
    const sortStr = sort ? `${order === 'desc' ? '-' : ''}${sort}` : '-created';
    
    const result = await pb.collection(this.collectionName).getList(page, limit, {
      sort: sortStr,
      filter: filter || '',
      expand: options.expand || '',
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
      const record = await pb.collection(this.collectionName).getOne(id);
      return this.mapRecord(record);
    } catch {
      throw new NotFoundError(`${this.collectionName} with id '${id}' not found`);
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

  // ===========================================================================
  // Write Operations
  // ===========================================================================

  /**
   * Create new record
   */
  async create(input: Partial<Omit<T, keyof BaseEntity>>, actorId?: string): Promise<T> {
    await this.ensureDbAvailable();
    
    const record = await pb.collection(this.collectionName).create(input);
    this.invalidateCache();
    
    this.log.info('Created record', { id: record.id });

    // Log activity
    const { activityLogService } = await import('./activity_log.service.js');
    void activityLogService.logCRUD(actorId, 'create', this.collectionName, record.id, { data: input });

    return this.mapRecord(record);
  }

  /**
   * Update existing record
   * 
   * @throws NotFoundError if record doesn't exist
   */
  async update(id: string, input: Partial<Omit<T, keyof BaseEntity>>, actorId?: string): Promise<T> {
    await this.ensureDbAvailable();
    
    try {
      const record = await pb.collection(this.collectionName).update(id, input);
      this.invalidateCache();
      
      this.log.info('Updated record', { id });

      // Log activity
      const { activityLogService } = await import('./activity_log.service.js');
      void activityLogService.logCRUD(actorId, 'update', this.collectionName, id, { data: input });

      return this.mapRecord(record);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new NotFoundError(`${this.collectionName} with id '${id}' not found`);
    }
  }

  /**
   * Delete record
   * 
   * @throws NotFoundError if record doesn't exist
   */
  async delete(id: string, actorId?: string): Promise<void> {
    await this.ensureDbAvailable();
    
    try {
      await pb.collection(this.collectionName).delete(id);
      this.invalidateCache();
      
      this.log.info('Deleted record', { id });

      // Log activity
      const { activityLogService } = await import('./activity_log.service.js');
      void activityLogService.logCRUD(actorId, 'delete', this.collectionName, id);
    } catch {
      throw new NotFoundError(`${this.collectionName} with id '${id}' not found`);
    }
  }

  // ===========================================================================
  // Protected Helpers
  // ===========================================================================

  /**
   * Ensure database is available
   * @throws ServiceUnavailableError if database is unavailable
   */
  protected async ensureDbAvailable(): Promise<void> {
    const available = await checkPocketBaseHealth();
    if (!available) {
      throw new ServiceUnavailableError('Database is currently unavailable');
    }
  }

  /**
   * Invalidate cache for this collection
   */
  protected invalidateCache(): void {
    invalidate(this.cacheKey);
  }
}
