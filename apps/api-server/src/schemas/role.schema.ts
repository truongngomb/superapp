/**
 * Role Validation Schemas
 */
import { z } from 'zod';
import { PermissionResource, PermissionAction } from '@superapp/shared-types';

// =============================================================================
// Permission Schema Components
// =============================================================================

/**
 * Schema for role permissions object
 * Maps resource names to arrays of action strings
 */
const permissionsSchema = z.record(
  z.nativeEnum(PermissionResource),
  z.array(z.nativeEnum(PermissionAction))
);

// =============================================================================
// Role Schemas
// =============================================================================

/**
 * Schema for creating a new role
 */
export const RoleCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  description: z.string().max(200, 'Description too long').optional(),
  permissions: permissionsSchema.default({} as Record<PermissionResource, PermissionAction[]>),
  isActive: z.boolean().optional(),
});

/**
 * Schema for updating an existing role
 */
export const RoleUpdateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  permissions: permissionsSchema.optional(),
  isActive: z.boolean().optional(),
});

// =============================================================================
// Inferred Types
// =============================================================================

export type RoleCreateSchemaType = z.infer<typeof RoleCreateSchema>;
export type RoleUpdateSchemaType = z.infer<typeof RoleUpdateSchema>;

// =============================================================================
// Legacy Export (for backward compatibility)
// =============================================================================

/**
 * @deprecated Import individual schemas instead
 */
export const RoleSchemas = {
  create: RoleCreateSchema,
  update: RoleUpdateSchema,
};
