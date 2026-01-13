/**
 * User Validation Schemas
 */
import { z } from 'zod';

// =============================================================================
// User Schemas
// =============================================================================

/**
 * Schema for creating a new user
 */
export const UserCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  passwordConfirm: z.string().optional(),
  isActive: z.boolean().default(true),
  roles: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.password && data.password !== data.passwordConfirm) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

/**
 * Schema for updating a user profile
 */
export const UserUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  avatar: z.string().max(500, 'Avatar URL too long').optional(),
  emailVisibility: z.boolean().optional(),
  isActive: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Schema for batch delete users
 */
export const UserBatchDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required').max(100, 'Maximum 100 items'),
});

/**
 * Schema for batch update user status
 */
export const UserBatchUpdateStatusSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required').max(100, 'Maximum 100 items'),
  isActive: z.boolean(),
});

/**
 * Schema for batch restore users
 */
export const UserBatchRestoreSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required').max(100, 'Maximum 100 items'),
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

export type UserCreateSchemaType = z.infer<typeof UserCreateSchema>;
export type UserUpdateSchemaType = z.infer<typeof UserUpdateSchema>;
export type UserBatchDeleteSchemaType = z.infer<typeof UserBatchDeleteSchema>;
export type UserBatchUpdateStatusSchemaType = z.infer<typeof UserBatchUpdateStatusSchema>;
export type UserBatchRestoreSchemaType = z.infer<typeof UserBatchRestoreSchema>;
export type UserRoleAssignmentSchemaType = z.infer<typeof UserRoleAssignmentSchema>;
