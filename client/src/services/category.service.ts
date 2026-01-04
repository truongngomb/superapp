/**
 * Category Service
 * Handles all category-related API calls
 */

import { api, createAbortController, API_ENDPOINTS, type RequestConfig } from '@/config';
import type { Category, CreateCategoryInput, UpdateCategoryInput, CategoryListParams, PaginatedCategories } from '@/types';

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
   * @param params Optional filters for search/color
   */
  async getAll(params?: CategoryListParams, config?: ServiceConfig): Promise<Category[]> {
    const { controller, clear } = createAbortController(config?.timeout ?? 10000);
    
    try {
      // Build query params if params provided
      let endpoint = API_ENDPOINTS.CATEGORIES;
      if (params) {
        const queryParams = new URLSearchParams();
        if (params.search) queryParams.append('search', params.search);
        if (params.color) queryParams.append('color', params.color);
        if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
        const queryString = queryParams.toString();
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
   * Get paginated categories
   */
  async getPage(params?: CategoryListParams, config?: ServiceConfig): Promise<PaginatedCategories> {
    const { controller, clear } = createAbortController(config?.timeout ?? 10000);
    
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.order) queryParams.append('order', params.order);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.color) queryParams.append('color', params.color);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.isDeleted !== undefined) queryParams.append('isDeleted', params.isDeleted.toString());

      const queryString = queryParams.toString();
      const endpoint = queryString ? `${API_ENDPOINTS.CATEGORIES}?${queryString}` : API_ENDPOINTS.CATEGORIES;

      return await api.get<PaginatedCategories>(endpoint, {
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
   * Restore soft-deleted category
   */
  async restore(id: string): Promise<void> {
    return api.post(`${API_ENDPOINTS.CATEGORIES}/${id}/restore`);
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
