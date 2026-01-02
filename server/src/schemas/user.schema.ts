/**
 * User Validation Schemas
 */
import { z } from 'zod';

// =============================================================================
// User Schemas
// =============================================================================

/**
 * Schema for updating a user profile
 */
export const UserUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .optional(),
  avatar: z.string().max(500, 'Avatar URL too long').optional(),
  emailVisibility: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for assigning roles to user
 */
export const UserRoleAssignmentSchema = z.object({
  roleIds: z.array(z.string().min(1, 'Role ID is required')).min(1, 'At least one role is required'),
});

// =============================================================================
// Inferred Types
// =============================================================================

export type UserUpdateSchemaType = z.infer<typeof UserUpdateSchema>;
export type UserRoleAssignmentSchemaType = z.infer<typeof UserRoleAssignmentSchema>;
