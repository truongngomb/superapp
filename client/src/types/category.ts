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

// ============================================================================
// Query Types
// ============================================================================

/**
 * Category list parameters for pagination and sorting
 */
export interface CategoryListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  color?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

/**
 * Paginated category response
 */
export interface PaginatedCategories {
  items: Category[];
  page: number;
  totalPages: number;
  total: number;
}
