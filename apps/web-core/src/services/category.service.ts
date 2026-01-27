/**
 * Category Service
 * Handles all category-related API calls
 */

import { BaseService, api } from '@superapp/core-logic';
import { API_ENDPOINTS, type RequestConfig, env, createAbortController } from '@/config';
import type { Category, CategoryListParams, PaginatedCategories } from '@superapp/shared-types';

class CategoryService extends BaseService<Category> {
  protected get endpoint(): string {
    return API_ENDPOINTS.CATEGORIES;
  }

  /**
   * Get all categories (with optional filters)
   */
  async getAll(params?: CategoryListParams, config?: RequestConfig): Promise<Category[]> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      // Build query params
      const searchParams = new URLSearchParams();
      if (params) {
        if (params.search) searchParams.append('search', params.search);
        if (params.color) searchParams.append('color', params.color);
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
      }
      
      const queryString = searchParams.toString();
      const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
      
      return await api.get<Category[]>(url, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  }

  /**
   * Get paginated categories
   * Override to handle specific params conversion if needed, 
   * or rely on BaseService if params match.
   * Since we have specific params like isActive, color, we keep strict typing
   */
  async getPage(params?: CategoryListParams, config?: RequestConfig): Promise<PaginatedCategories> {
    // BaseService uses JSON.stringify for non-string values.
    // If backend expects "true"/"false" for boolean, it works fine.
    return super.getPage(params, config);
  }

  /**
   * Batch delete categories
   */
  async deleteMany(ids: string[]): Promise<boolean | undefined> {
    return api.post(`${this.endpoint}/batch-delete`, { ids });
  }

  /**
   * Batch update categories status
   */
  async batchUpdateStatus(ids: string[], isActive: boolean): Promise<boolean | undefined> {
    return api.post(`${this.endpoint}/batch-status`, { ids, isActive });
  }

  /**
   * Batch restore categories
   */
  async restoreMany(ids: string[]): Promise<boolean | undefined> {
    return api.post(`${this.endpoint}/batch-restore`, { ids });
  }

  /**
   * Get all categories for export (no pagination)
   */
  async getAllForExport(params?: CategoryListParams, config?: RequestConfig): Promise<Category[]> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      const queryParams = new URLSearchParams();
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.order) queryParams.append('order', params.order);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.color) queryParams.append('color', params.color);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.isDeleted !== undefined) queryParams.append('isDeleted', params.isDeleted.toString());

      const queryString = queryParams.toString();
      const url = queryString 
        ? `${this.endpoint}/export?${queryString}` 
        : `${this.endpoint}/export`;

      return await api.get<Category[]>(url, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  }
}

export const categoryService = new CategoryService();
