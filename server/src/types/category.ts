/**
 * Category Types
 */
import type { BaseEntity, CreateInput, UpdateInput } from './common.js';

// =============================================================================
// Category Entity
// =============================================================================

/**
 * Category entity representing a content category
 */
export interface Category extends BaseEntity {
  /** Category display name */
  name: string;
  /** Category description */
  description: string;
  /** Hex color code for UI display */
  color: string;
  /** Icon identifier */
  icon: string;
  /** Active status */
  isActive: boolean;
}

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

/**
 * @deprecated Use CategoryCreateInput instead
 */
export type CategoryInput = CategoryCreateInput;
