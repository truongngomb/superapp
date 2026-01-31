/**
 * Base Service
 * 
 * Abstract base class for PocketBase collection services.
 * Provides CRUD operations with caching, soft delete support, and batch operations.
 */
import { adminPb, getOrSet, invalidate, ensureAdminAuth, config } from '../config/index.js';
import { NotFoundError, InternalServerError } from '../middleware/index.js';
import { createLogger } from '../utils/logger.js';
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

  /**
   * Map domain entity (or partial) to PocketBase record
   * Can be overridden by subclasses to handle field mapping (e.g. camelCase to snake_case)
   */
  protected mapToRecord(input: Partial<Omit<T, keyof MinimalEntity>>): Record<string, unknown> {
    return input as Record<string, unknown>;
  }

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
   */
  async create(input: Partial<Omit<T, keyof MinimalEntity>>, _actorId?: string, _skipLog = false): Promise<T> {
    await this.ensureDbAvailable();
    const data = this.mapToRecord(input);
    const record = await this.collection.create(data);
    this.invalidateCache();
    this.log.info('Created record', { id: record.id });
    // TODO: Connect ActivityLog service
    return this.mapRecord(record);
  }

  /**
   * Update existing record
   */
  async update(id: string, input: Partial<Omit<T, keyof MinimalEntity>>, _actorId?: string, _skipLog = false): Promise<T> {
    await this.ensureDbAvailable();
    
    try {
      const data = this.mapToRecord(input);
      const record = await this.collection.update(id, data);
      this.invalidateCache();
      this.log.info('Updated record', { id });
      return this.mapRecord(record);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      if ((error as { status?: number }).status === 404) {
        throw new NotFoundError(`${this.collectionName} with id '${id}' not found`);
      }
      throw error;
    }
  }

  /**
   * Update multiple records in parallel
   */
  async updateMany(ids: string[], input: Partial<Omit<T, keyof MinimalEntity>>, _actorId?: string): Promise<void> {
    await this.ensureDbAvailable();
    const data = this.mapToRecord(input);
    await Promise.all(ids.map(async (id) => {
      await this.collection.update(id, data);
    }));
    this.invalidateCache();
    this.log.info('Batch updated records', { count: ids.length, ids });
  }

  /**
   * Soft delete record (set isDeleted = true)
   */
  async delete(id: string, _actorId?: string, _skipLog = false): Promise<void> {
    await this.ensureDbAvailable();
    await this.collection.update(id, { isDeleted: true });
    this.invalidateCache();
    this.log.info('Soft deleted record', { id });
  }

  /**
   * Hard delete record (permanently remove from database)
   */
  async hardDelete(id: string, _actorId?: string): Promise<void> {
    await this.ensureDbAvailable();
    try {
      await this.collection.delete(id);
      this.invalidateCache();
      this.log.info('Hard deleted record', { id });
    } catch {
      throw new NotFoundError(`${this.collectionName} with id '${id}' not found`);
    }
  }

  /**
   * Restore soft-deleted record
   */
  async restore(id: string, _actorId?: string): Promise<void> {
    await this.ensureDbAvailable();
    await this.collection.update(id, { isDeleted: false });
    this.invalidateCache();
    this.log.info('Restored soft-deleted record', { id });
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
    
    const defaultField = this.defaultFilter.split('=')[0]?.trim();
    if (defaultField && userFilter.includes(defaultField)) {
      return userFilter;
    }
    
    return `(${userFilter}) && ${this.defaultFilter}`;
  }

  /**
   * Ensure database is available
   */
  protected async ensureDbAvailable(): Promise<void> {
    // Check Config first
    if (!config.pocketbaseAdminEmail || !config.pocketbaseAdminPassword) {
      // If no admin credentials, we can't ensure availability effectively in this architecture
      // throw new InternalServerError('Database configuration missing (Admin Credentials)');
      // For now log warning, but proceed - maybe public access or existing token works?
      this.log.warn('Missing Admin Credentials - proceeding without fresh auth');
    }

    // Optimization: Skip explicit health check on every request to improve performance.
    // The actual DB operation or ensureAdminAuth will fail if PB is down.
    // const available = await checkPocketBaseHealth();
    // if (!available) {
    //   throw new ServiceUnavailableError('Database is currently unavailable');
    // }
    
    try {
      await ensureAdminAuth();
    } catch (err: unknown) {
      // If admin auth fails, throw 500
      const msg = err instanceof Error ? err.message : 'Unknown error';
      throw new InternalServerError(`Database Authorization Failed: ${msg}`);
    }
  }

  /**
   * Invalidate cache for this collection
   */
  protected invalidateCache(): void {
    invalidate(this.cacheKey);
  }
}
