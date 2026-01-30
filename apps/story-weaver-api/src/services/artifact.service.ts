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
      projectId: record['projectId'] as string,
      userId: record['userId'] as string,
      type: record['type'] as Artifact['type'],
      entityId: (record['entityId'] as string) || undefined,
      entityType: (record['entityType'] as string) || undefined,
      version: (record['version'] as number) || 1,
      status: record['status'] as Artifact['status'],
      data: (record['data'] as Artifact['data']) || {},
      parentArtifactId: (record['parentArtifactId'] as string) || undefined,
      isActive: (record['isActive'] as boolean) ?? true,
      isDeleted: (record['isDeleted'] as boolean) || false,
      created: record['created'] as string,
      updated: record['updated'] as string,
    };
  }

  protected override mapToRecord(input: Partial<Artifact>): Record<string, unknown> {
    const record: Record<string, unknown> = {};

    if (input.projectId !== undefined) record['projectId'] = input.projectId;
    if (input.userId !== undefined) record['userId'] = input.userId;
    if (input.type !== undefined) record['type'] = input.type;
    if (input.entityId !== undefined) record['entityId'] = input.entityId;
    if (input.entityType !== undefined) record['entityType'] = input.entityType;
    if (input.version !== undefined) record['version'] = input.version;
    if (input.status !== undefined) record['status'] = input.status;
    if (input.data !== undefined) record['data'] = input.data;
    if (input.parentArtifactId !== undefined) record['parentArtifactId'] = input.parentArtifactId;
    if (input.isActive !== undefined) record['isActive'] = input.isActive;
    if (input.isDeleted !== undefined) record['isDeleted'] = input.isDeleted;

    return record;
  }

  /**
   * Get the latest version of an artifact by type and entity
   */
  async getLatestVersion(projectId: string, type: string, entityId?: string): Promise<Artifact | null> {
    const filter = entityId 
      ? `projectId = "${projectId}" && type = "${type}" && entityId = "${entityId}"`
      : `projectId = "${projectId}" && type = "${type}"`;
    
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
