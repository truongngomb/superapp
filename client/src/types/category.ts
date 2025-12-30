/**
 * Category Types
 */

import type { BaseEntity } from './common';

// ============================================================================
// Entity
// ============================================================================

/**
 * Category entity from API
 */
export interface Category extends BaseEntity {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

// ============================================================================
// Input/DTO Types
// ============================================================================

/**
 * Create category input
 */
export interface CreateCategoryInput {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive?: boolean;
}

/**
 * Update category input (all fields optional)
 */
export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

/**
 * Alias for backward compatibility
 */
export type CategoryInput = CreateCategoryInput;

// ============================================================================
// Query Types
// ============================================================================

/**
 * Category filter options
 */
export interface CategoryFilters {
  search?: string;
  color?: string;
  isActive?: boolean;
}
