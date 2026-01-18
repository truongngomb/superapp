/**
 * Markdown Service
 * Handles all markdown page-related API calls
 */

import { api, createAbortController, API_ENDPOINTS, type RequestConfig, env } from '@/config';
import type { 
  MarkdownPage, 
  MarkdownPageCreateInput, 
  MarkdownPageUpdateInput, 
  MarkdownPageListParams, 
  PaginatedMarkdownPages,
  MarkdownMenuItem,
  MenuPositionType
} from '@superapp/shared-types';

interface ServiceConfig extends Omit<RequestConfig, 'signal'> {
  timeout?: number;
  signal?: AbortSignal;
}

export const markdownService = {
  /**
   * Get paginated markdown pages
   */
  async getPage(params?: MarkdownPageListParams, config?: ServiceConfig): Promise<PaginatedMarkdownPages> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sort) queryParams.append('sort', params.sort);
      if (params?.order) queryParams.append('order', params.order);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isPublished !== undefined) queryParams.append('isPublished', params.isPublished.toString());
      if (params?.showInMenu !== undefined) queryParams.append('showInMenu', params.showInMenu.toString());
      if (params?.menuPosition) queryParams.append('menuPosition', params.menuPosition);

      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `${API_ENDPOINTS.MARKDOWN_PAGES}?${queryString}` 
        : API_ENDPOINTS.MARKDOWN_PAGES;

      return await api.get<PaginatedMarkdownPages>(endpoint, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Get all pages (for dropdowns/parents)
   */
  async getAll(config?: ServiceConfig): Promise<MarkdownPage[]> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      return await api.get<MarkdownPage[]>(`${API_ENDPOINTS.MARKDOWN_PAGES}?limit=500`, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Get page by ID
   */
  async getById(id: string, config?: ServiceConfig): Promise<MarkdownPage> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      return await api.get<MarkdownPage>(`${API_ENDPOINTS.MARKDOWN_PAGES}/${id}`, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Get public page by slug
   */
  async getBySlug(slug: string, config?: ServiceConfig): Promise<MarkdownPage> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      // Access public endpoint
      return await api.get<MarkdownPage>(`${API_ENDPOINTS.MARKDOWN_PAGES}/slug/${slug}`, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Get menu tree by position
   */
  async getMenuTree(position: MenuPositionType, config?: ServiceConfig): Promise<MarkdownMenuItem[]> {
    const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
    
    try {
      // Access public endpoint
      return await api.get<MarkdownMenuItem[]>(`${API_ENDPOINTS.MARKDOWN_PAGES}/menu/${position}`, {
        signal: config?.signal ?? controller.signal,
      });
    } finally {
      clear();
    }
  },

  /**
   * Create new page
   */
  async create(data: MarkdownPageCreateInput | FormData): Promise<MarkdownPage> {
    return api.post<MarkdownPage>(API_ENDPOINTS.MARKDOWN_PAGES, data);
  },

  /**
   * Update existing page
   */
  async update(id: string, data: MarkdownPageUpdateInput | FormData): Promise<MarkdownPage> {
    return api.put<MarkdownPage>(`${API_ENDPOINTS.MARKDOWN_PAGES}/${id}`, data);
  },

  /**
   * Delete page
   */
  async delete(id: string): Promise<void> {
    return api.delete(`${API_ENDPOINTS.MARKDOWN_PAGES}/${id}`);
  },

  /**
   * Restore page
   */
  async restore(id: string): Promise<void> {
    return api.post(`${API_ENDPOINTS.MARKDOWN_PAGES}/${id}/restore`);
  },

  /**
   * Batch delete pages
   */
  async deleteMany(ids: string[]): Promise<void> {
    return api.post(`${API_ENDPOINTS.MARKDOWN_PAGES}/batch-delete`, { ids });
  },

  /**
   * Batch restore pages
   */
  async restoreMany(ids: string[]): Promise<void> {
    return api.post(`${API_ENDPOINTS.MARKDOWN_PAGES}/batch-restore`, { ids });
  },

  /**
   * Batch update status
   */
  async batchUpdateStatus(ids: string[], isActive: boolean): Promise<void> {
    return api.post(`${API_ENDPOINTS.MARKDOWN_PAGES}/batch-status`, { ids, isActive });
  },
};
