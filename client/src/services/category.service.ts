/**
 * Category Service
 * Handles all category-related API calls
 */

import { api, createAbortController, API_ENDPOINTS, type RequestConfig } from '@/config';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryFilters } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface ServiceConfig extends Omit<RequestConfig, 'signal'> {
  /** Request timeout in ms (default: 10000) */
  timeout?: number;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

// ============================================================================
// Service
// ============================================================================

export const categoryService = {
  /**
   * Get all categories
   * @param filters Optional filters for search/color
   */
  async getAll(filters?: CategoryFilters, config?: ServiceConfig): Promise<Category[]> {
    const { controller, clear } = createAbortController(config?.timeout ?? 10000);
    
    try {
      // Build query params if filters provided
      let endpoint = API_ENDPOINTS.CATEGORIES;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.color) params.append('color', filters.color);
        const queryString = params.toString();
        if (queryString) endpoint += `?${queryString}`;
      }
      
      return await api.get<Category[]>(endpoint, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Get category by ID
   */
  async getById(id: string, config?: ServiceConfig): Promise<Category> {
    const { controller, clear } = createAbortController(config?.timeout ?? 10000);
    
    try {
      return await api.get<Category>(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Create new category
   */
  async create(data: CreateCategoryInput): Promise<Category> {
    return api.post<Category>(API_ENDPOINTS.CATEGORIES, data);
  },

  /**
   * Update existing category
   */
  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    return api.put<Category>(`${API_ENDPOINTS.CATEGORIES}/${id}`, data);
  },

  /**
   * Delete category by ID
   */
  async delete(id: string): Promise<void> {
    return api.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
  },

  /**
   * Batch delete categories
   */
  async deleteMany(ids: string[]): Promise<void> {
    return api.post(`${API_ENDPOINTS.CATEGORIES}/batch-delete`, { ids });
  },
};
