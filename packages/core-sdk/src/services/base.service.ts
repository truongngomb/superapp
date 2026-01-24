import PocketBase from 'pocketbase';
import NodeCache from 'node-cache';

export interface BaseServiceOptions {
  pocketbaseUrl: string;
  adminEmail: string;
  adminPassword: string;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  filter?: string;
  sort?: string;
}

export interface PaginationResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
}

/**
 * Base service class providing common CRUD operations
 * Extend this class for domain-specific services
 */
export abstract class BaseService<T> {
  protected pb: PocketBase;
  protected cache: NodeCache;
  protected abstract collectionName: string;
  protected abstract cacheKey: string;

  constructor(protected options: BaseServiceOptions) {
    this.pb = new PocketBase(options.pocketbaseUrl);
    this.cache = new NodeCache({ stdTTL: 600 }); // 10 min default
    this.authenticate();
  }

  private async authenticate() {
    try {
      await this.pb.admins.authWithPassword(
        this.options.adminEmail,
        this.options.adminPassword
      );
    } catch (error) {
      console.error('Failed to authenticate with PocketBase:', error);
    }
  }

  /**
   * Get all records with pagination
   */
  async getAll(params: PaginationParams = {}): Promise<PaginationResult<T>> {
    const cacheKey = `${this.cacheKey}:all:${JSON.stringify(params)}`;
    const cached = this.cache.get<PaginationResult<T>>(cacheKey);
    if (cached) return cached;

    const result = await this.pb.collection(this.collectionName).getList(
      params.page || 1,
      params.perPage || 50,
      {
        filter: params.filter || 'isDeleted = false',
        sort: params.sort || '-created',
      }
    );

    const data: PaginationResult<T> = {
      items: result.items.map((r) => this.mapRecord(r)),
      totalItems: result.totalItems,
      totalPages: result.totalPages,
    };

    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Get record by ID
   */
  async getById(id: string): Promise<T> {
    const cacheKey = `${this.cacheKey}:${id}`;
    const cached = this.cache.get<T>(cacheKey);
    if (cached) return cached;

    const record = await this.pb.collection(this.collectionName).getOne(id);
    const mapped = this.mapRecord(record);
    
    this.cache.set(cacheKey, mapped);
    return mapped;
  }

  /**
   * Create new record
   */
  async create(data: Partial<T>, actorId?: string): Promise<T> {
    const record = await this.pb.collection(this.collectionName).create(data);
    this.invalidateCache();
    
    if (actorId) {
      await this.logActivity(actorId, 'create', record.id);
    }

    return this.mapRecord(record);
  }

  /**
   * Update existing record
   */
  async update(id: string, data: Partial<T>, actorId?: string): Promise<T> {
    const record = await this.pb.collection(this.collectionName).update(id, data);
    this.invalidateCache();
    
    if (actorId) {
      await this.logActivity(actorId, 'update', id);
    }

    return this.mapRecord(record);
  }

  /**
   * Soft delete record
   */
  async delete(id: string, actorId?: string): Promise<void> {
    await this.pb.collection(this.collectionName).update(id, {
      isDeleted: true,
    });
    this.invalidateCache();
    
    if (actorId) {
      await this.logActivity(actorId, 'delete', id);
    }
  }

  /**
   * Restore soft-deleted record
   */
  async restore(id: string, actorId?: string): Promise<T> {
    const record = await this.pb.collection(this.collectionName).update(id, {
      isDeleted: false,
    });
    this.invalidateCache();
    
    if (actorId) {
      await this.logActivity(actorId, 'restore', id);
    }

    return this.mapRecord(record);
  }

  /**
   * Map PocketBase record to domain model
   * Must be implemented by subclasses
   */
  protected abstract mapRecord(record: Record<string, unknown>): T;

  /**
   * Invalidate all cache entries for this service
   */
  protected invalidateCache(): void {
    const keys = this.cache.keys();
    keys.forEach((key) => {
      if (key.startsWith(this.cacheKey)) {
        this.cache.del(key);
      }
    });
  }

  /**
   * Log activity to activity_logs collection
   */
  protected async logActivity(
    actorId: string,
    action: string,
    resourceId: string
  ): Promise<void> {
    try {
      await this.pb.collection('activity_logs').create({
        user_id: actorId,
        action,
        resource: this.collectionName,
        resource_id: resourceId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw - activity log failure shouldn't block operation
    }
  }
}
