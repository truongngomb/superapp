/**
 * Artifact Service
 * 
 * Handles CRUD and versioning for AI artifacts.
 */
import { BaseService } from './base.service.js';
import type { Artifact } from '../types/artifact.js';

class ArtifactService extends BaseService<Artifact> {
  protected readonly collectionName = 'sw_artifacts';
  protected readonly cacheKey = 'sw_artifacts';
  
  // Default filter: only not deleted
  protected readonly defaultFilter = 'isDeleted = false';

  protected mapRecord(record: Record<string, unknown>): Artifact {
    return {
      id: record['id'] as string,
      projectId: record['project_id'] as string,
      userId: record['user_id'] as string,
      type: record['type'] as Artifact['type'],
      entityId: (record['entity_id'] as string) || undefined,
      entityType: (record['entity_type'] as string) || undefined,
      version: (record['version'] as number) || 1,
      status: record['status'] as Artifact['status'],
      data: (record['data'] as Artifact['data']) || {},
      parentArtifactId: (record['parent_artifact_id'] as string) || undefined,
      isActive: (record['isActive'] as boolean) ?? true,
      isDeleted: (record['isDeleted'] as boolean) || false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  /**
   * Get the latest version of an artifact by type and entity
   */
  async getLatestVersion(projectId: string, type: string, entityId?: string): Promise<Artifact | null> {
    const filter = entityId 
      ? `project_id = "${projectId}" && type = "${type}" && entity_id = "${entityId}"`
      : `project_id = "${projectId}" && type = "${type}"`;
    
    const records = await this.getPage({
      filter,
      sort: 'version',
      order: 'desc',
      limit: 1
    });

    return records.items[0] || null;
  }
}

export const artifactService = new ArtifactService();
