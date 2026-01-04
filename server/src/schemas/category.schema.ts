/**
 * Category Validation Schemas
 */
import { z } from 'zod';

// =============================================================================
// Common Schema Components
// =============================================================================

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color');

// =============================================================================
// Category Schemas
// =============================================================================

/**
 * Schema for creating a new category
 */
export const CategoryCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').default(''),
  color: hexColor.default('#3b82f6'),
  icon: z.string().min(1).default('folder'),
  isActive: z.boolean().default(true),
});

/**
 * Schema for updating an existing category
 */
export const CategoryUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  color: hexColor.optional(),
  icon: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for batch delete categories
 */
export const BatchDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required').max(100, 'Maximum 100 items'),
});

// =============================================================================
// Inferred Types
// =============================================================================

export type CategoryCreateSchemaType = z.infer<typeof CategoryCreateSchema>;
export type CategoryUpdateSchemaType = z.infer<typeof CategoryUpdateSchema>;
export type BatchDeleteSchemaType = z.infer<typeof BatchDeleteSchema>;

// =============================================================================
// Legacy Export (for backward compatibility)
// =============================================================================

/**
 * @deprecated Import individual schemas instead
 */
export const CategorySchemas = {
  create: CategoryCreateSchema,
  update: CategoryUpdateSchema,
};
