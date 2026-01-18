import { pb } from '../../config/database.js';
import { logger } from '../../utils/index.js';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';

export default async function seed(): Promise<void> {
  logger.info('MarkdownSeed', 'Seeding markdown permissions...');

  const RESOURCE = PermissionResource.MarkdownPages;
  const SUPER_ADMIN_ROLE_NAME = 'Super Admin';

  try {
    let role;
    try {
      role = await pb.collection('roles').getFirstListItem(`name="${SUPER_ADMIN_ROLE_NAME}"`);
    } catch (error) {
      logger.warn('MarkdownSeed', `Role "${SUPER_ADMIN_ROLE_NAME}" not found. Skipping permission seeding.`, { error });
      return;
    }

    // Define typed interface for safe access
    interface RoleRecord {
      id: string;
      permissions?: Record<string, string[]>;
    }
    
    // 2. Check if permissions need update
    const roleRecord = role as unknown as RoleRecord;
    const currentPermissions = roleRecord.permissions || {};
    const hasPermission = currentPermissions[RESOURCE]?.includes(PermissionAction.Manage);
    
    if (hasPermission) {
      logger.info('MarkdownSeed', 'Markdown permissions already exist for Super Admin.');
      return;
    }

    // 3. Update permissions
    const updatedPermissions: Record<string, string[]> = {
      ...currentPermissions,
      [RESOURCE]: [
        PermissionAction.View,
        PermissionAction.Create,
        PermissionAction.Update,
        PermissionAction.Delete,
        PermissionAction.Manage
      ]
    };

    await pb.collection('roles').update(roleRecord.id, {
      permissions: updatedPermissions
    });

    logger.info('MarkdownSeed', 'Successfully added markdown permissions to Super Admin role.');
  } catch (error) {
    logger.error('MarkdownSeed', 'Failed to seed markdown permissions:', { error });
    // Don't throw error to avoid stopping other seeds
  }
}
