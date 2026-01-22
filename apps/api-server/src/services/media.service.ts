/**
 * Media Service
 * Handles file upload and serving
 */
import { BaseService } from './base.service.js';
import type { Media } from '@superapp/shared-types';
import { config } from '../config/index.js';
import { ForbiddenError, NotFoundError } from '../middleware/index.js';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';
import { permissionService } from './permission.service.js';

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
    
    // Add owner if provided
    if (actorId && !formData.has('user')) {
      formData.append('user', actorId);
    }
    
    // Create record with file (PocketBase handles file upload via FormData)
    const record = await this.collection.create(formData);
    
    this.invalidateCache();
    this.log.info('Uploaded media', { id: record.id });
    this.logActivity(actorId, 'create', record.id);
    
    return this.mapRecord(record);
  }

  /**
   * Delete media
   * Checks ownership of the REFERENCED entity before deletion.
   * Logic:
   * 1. If User is Admin -> Allow.
   * 2. If Media refers to User (Avatar) and ID matches -> Allow.
   * 3. If Media is own by User (user field) -> Allow.
   * 4. If Media refers to an entity owned by User (user_id/owner check) -> Allow.
   * 5. Otherwise -> Forbidden.
   */
  async delete(id: string, actorId?: string): Promise<void> {
    if (actorId) {
      await this.ensureDbAvailable();
      
      // 1. Check if User is Admin
      const isAdmin = await this.isUserAdmin(actorId);
      if (isAdmin) {
        return this.hardDelete(id, actorId);
      }

      // 2. Get Media Record
      let record;
      try {
        record = await this.collection.getOne(id);
      } catch {
        throw new NotFoundError(`${this.collectionName} with id '${id}' not found`);
      }
      
      // 3. Check Direct Ownership (New 'user' field)
      // Cast record to unknown to access dynamic field 'user'
      const recordData = record as unknown as Record<string, unknown>;
      if (recordData['user'] === actorId) {
        return this.hardDelete(id, actorId);
      }

      // 4. Check Reference
      const { refId, refType } = record;
      
      if (!refId || !refType) {
        // Orphaned media or missing ref - only Owner or Admin can delete
        throw new ForbiddenError('You do not have permission to delete this media (orphaned)');
      }

      // 5. Check Ownership of Referenced Entity
      if (refType === 'users' && refId === actorId) {
        // User deleting their own avatar/media
        return this.hardDelete(id, actorId);
      }

      try {
         // Generic check: Does the referenced record belong to the user?
         // Cast refType/refId to string to satisfy TS
         const refTypeStr = String(refType);
         const refIdStr = String(refId);

         const refRecord = await this.db.collection(refTypeStr).getOne(refIdStr);
         
         // Common ownership field names
         // Cast to unknown first then string comparison
         const refRecordData = refRecord as unknown as Record<string, unknown>;
         const ownerId = refRecordData['user_id'] || refRecordData['userId'] || refRecordData['owner'] || refRecordData['createdBy'];
         
         if (String(ownerId) === actorId) {
           await this.hardDelete(id, actorId);
           return;
         }

         // Special Handling for Managed Resources (e.g., Markdown Pages)
         // If generic ownership check fails, check if user has explicit permission to manage the resource
         if (refTypeStr === (PermissionResource.MarkdownPages as string)) {
           const perms = await permissionService.getUserPermissions(actorId);
           const resourcePerms = perms[PermissionResource.MarkdownPages] || [];
           
           // Allow if user has Update, Delete, or Manage permission on Markdown Pages
           // We include Update because editing a page often involves managing its media
           const hasPerm = resourcePerms.some(p => 
             p === PermissionAction.Update || 
             p === PermissionAction.Delete || 
             p === PermissionAction.Manage
           );

           if (hasPerm) {
             this.log.info('Allowed media deletion via permission', { actorId, refType: refTypeStr, id });
             await this.hardDelete(id, actorId);
             return;
           }
         }

      } catch (err: unknown) {
         // Referenced record not found or accessible
         this.log.error('Failed to check referenced record', { refId: String(refId), refType: String(refType), error: String(err) });
      }

      throw new ForbiddenError('You do not have permission to delete this media');
    }

    // No actorId (Internal/System call) -> Allow or require checks? 
    // Usually system calls (actorId undefined) are trusted. 
    // But if coming from Controller, actorId should be present for auth users.
    if (!actorId) {
       // Assuming system call, but safer to block if uncertain. 
       // For now, consistent with BaseService: if we don't pass actorId, we trust the caller (internal).
       return this.hardDelete(id, actorId);
    }
  }

  /**
   * Helper to check if user has Admin role
   */
  private async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.db.collection('users').getOne(userId, { expand: 'roles' });
      // expand is dynamic, we assume types here
      const roles = (user.expand?.roles || []) as Array<{ name?: string }>;
      // Check for 'admin', 'super admin', 'manager' etc. Adjust based on system roles.
      return roles.some(r => {
        const name = r.name?.toLowerCase() || '';
        return ['admin', 'super admin', 'superadmin'].includes(name);
      });
    } catch {
      return false;
    }
  }
}

export const mediaService = new MediaService();
