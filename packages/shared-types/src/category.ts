/**
 * Category Types
 */

import type { BaseEntity, PaginatedResponse, BaseListParams } from './common.js';

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

// ============================================================================
// Alias Types (for Backend Consistency)
// ============================================================================

export type CategoryCreateInput = CreateCategoryInput;
export type CategoryUpdateInput = UpdateCategoryInput;

// ============================================================================
// Query Types
// ============================================================================

/**
 * Category list parameters for pagination and sorting
 */
export interface CategoryListParams extends BaseListParams {
  color?: string;
}

/**
 * Paginated category response
 */
export type PaginatedCategories = PaginatedResponse<Category>;
