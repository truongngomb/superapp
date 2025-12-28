/**
 * Common Validation Schemas
 * 
 * Reusable schema components for validation across the application.
 */
import { z } from 'zod';

// =============================================================================
// Primitive Schemas
// =============================================================================

/**
 * MongoDB/PocketBase ID format
 */
export const idSchema = z.string().min(1, 'ID is required');

/**
 * Non-empty trimmed string
 */
export const nonEmptyString = z.string().min(1).transform((s) => s.trim());

/**
 * Email address
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * URL
 */
export const urlSchema = z.string().url('Invalid URL');

/**
 * Hex color code (#RRGGBB)
 */
export const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color');

// =============================================================================
// Query Schemas
// =============================================================================

/**
 * Pagination query parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Sorting query parameters
 */
export const sortSchema = z.object({
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * Combined pagination and sorting
 */
export const listQuerySchema = paginationSchema.merge(sortSchema);

// =============================================================================
// Param Schemas
// =============================================================================

/**
 * ID path parameter
 */
export const idParamSchema = z.object({
  id: idSchema,
});

// =============================================================================
// Inferred Types
// =============================================================================

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type SortQuery = z.infer<typeof sortSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;

// =============================================================================
// Legacy Export (for backward compatibility)
// =============================================================================

/**
 * @deprecated Import individual schemas instead
 */
export const schemas = {
  id: idSchema,
  pagination: paginationSchema,
  nonEmptyString,
  email: emailSchema,
  url: urlSchema,
  hexColor: hexColorSchema,
};
