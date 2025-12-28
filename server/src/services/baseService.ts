import { pb, getOrSet, invalidateByPattern, checkPocketBaseHealth } from '../config/index.js';
import { NotFoundError } from '../middleware/index.js';
import { logger } from '../utils/index.js';

/**
 * Base generic service for PocketBase collections
 */
export abstract class BaseService<T extends { id: string }> {
  protected abstract collectionName: string;
  protected abstract cacheKey: string;
  protected cacheTtl: number = 300; // 5 minutes

  /**
   * Helper to mapping PocketBase record to domain type
   * Must be implemented by subclasses
   */
  protected abstract mapRecord(record: Record<string, unknown>): T;

  /**
   * Get all records
   */
  async getAll(): Promise<T[]> {
    return getOrSet(this.cacheKey, async () => {
      const pbAvailable = await checkPocketBaseHealth();

      if (pbAvailable) {
        try {
          const records = await pb.collection(this.collectionName).getFullList();
          return records.map((r) => this.mapRecord(r));
        } catch (error) {
          logger.error(this.constructor.name, 'PocketBase error:', error);
        }
      }

      return this.getFallbackData();
    }, this.cacheTtl);
  }

  /**
   * Get record by ID
   */
  async getById(id: string): Promise<T> {
    const items = await this.getAll();
    const item = items.find((i) => i.id === id);

    if (!item) {
      throw new NotFoundError(`Resource with id ${id} not found`);
    }

    return item;
  }

  /**
   * Create new record
   */
  async create(input: Partial<Omit<T, 'id' | 'created' | 'updated'>>): Promise<T> {
    const pbAvailable = await checkPocketBaseHealth();

    if (pbAvailable) {
      try {
        const record = await pb.collection(this.collectionName).create(input);
        invalidateByPattern(this.cacheKey);
        return this.mapRecord(record);
      } catch (error) {
        logger.error(this.constructor.name, 'PocketBase error:', error);
        throw error;
      }
    }

    throw new Error('Database unavailable');
  }

  /**
   * Update record
   */
  async update(id: string, input: Partial<Omit<T, 'id' | 'created' | 'updated'>>): Promise<T> {
    const pbAvailable = await checkPocketBaseHealth();

    if (pbAvailable) {
      try {
        const record = await pb.collection(this.collectionName).update(id, input);
        invalidateByPattern(this.cacheKey);
        return this.mapRecord(record);
      } catch (error) {
        logger.error(this.constructor.name, 'PocketBase error:', error);
        throw error;
      }
    }

    throw new Error('Database unavailable');
  }

  /**
   * Delete record
   */
  async delete(id: string): Promise<void> {
    const pbAvailable = await checkPocketBaseHealth();

    if (pbAvailable) {
      try {
        await pb.collection(this.collectionName).delete(id);
        invalidateByPattern(this.cacheKey);
        return;
      } catch (error) {
        logger.error(this.constructor.name, 'PocketBase error:', error);
        throw error;
      }
    }

    throw new Error('Database unavailable');
  }

  /**
   * Optional fallback data for read operations when DB is down
   */
  protected getFallbackData(): T[] {
    return [];
  }
}
