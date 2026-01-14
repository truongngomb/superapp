/**
 * Category Types
 */
import type { Category } from '@superapp/shared-types';
import type { CreateInput, UpdateInput } from './common.js';

// Re-export entity
export type { Category } from '@superapp/shared-types';

// =============================================================================
// Category Input Types
// =============================================================================

/**
 * Input for creating a new category
 */
export type CategoryCreateInput = CreateInput<Category> & { isActive?: boolean };

/**
 * Input for updating an existing category
 */
export type CategoryUpdateInput = UpdateInput<Category> & { isActive?: boolean };
