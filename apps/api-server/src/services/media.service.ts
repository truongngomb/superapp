/**
 * Media Service
 * Handles file upload and serving
 */
import { BaseService } from './base.service.js';
import type { Media } from '@superapp/shared-types';
import { config } from '../config/index.js';

export class MediaService extends BaseService<Media> {
  protected collectionName = 'media';
  protected cacheKey = 'media';
  // No soft delete for media, direct deletion or maybe we want soft delete?
  // Let's assume soft delete is not strictly required for media assets in this phase, 
  // but BaseService supports it if we add isDeleted field to collection.
  // Our current Schema DOES NOT have isDeleted. So we should override delete to be hard delete or add isDeleted.
  // For media, hard delete to save space is often preferred, or we just stick to standard Delete (which BaseService delete() does soft delete if defaultFilter uses it).
  // Check our collection schema: NO isDeleted.
  // So we should NOT use BaseService.delete() which updates isDeleted=true.
  // We should override/use hardDelete.

  protected mapRecord(record: Record<string, unknown>): Media {
    const filename = record.file as string;
    return {
      id: record.id as string,
      collectionId: record.collectionId as string,
      collectionName: record.collectionName as string,
      created: record.created as string,
      updated: record.updated as string,
      file: filename,
      alt: record.alt as string,
      caption: record.caption as string,
      refId: record.refId as string | undefined,
      refType: record.refType as string | undefined,
      // Full URL helper
      // Typically: /api/files/:collectionId/:recordId/:filename
      url: `${config.pocketbaseUrl}/api/files/${record.collectionId as string}/${record.id as string}/${filename}`,
    } as Media;
  }

  /**
   * Upload (Create) Media
   */
  async upload(formData: FormData, actorId?: string): Promise<Media & { url: string }> {
    await this.ensureDbAvailable();
    
    // Create record with file (PocketBase handles file upload via FormData)
    const record = await this.collection.create(formData);
    
    this.invalidateCache();
    this.log.info('Uploaded media', { id: record.id });
    this.logActivity(actorId, 'create', record.id);
    
    return this.mapRecord(record);
  }

  /**
   * Override delete to use hardDelete since we assume media should be physically removed
   * or strictly speaking if we want soft delete we should have added isDeleted to schema.
   * Given the plan, let's treat media delete as hard delete for now to avoid confusion.
   */
  async delete(id: string, actorId?: string): Promise<void> {
    return this.hardDelete(id, actorId);
  }
}

export const mediaService = new MediaService();
