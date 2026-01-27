/**
 * Base Service Class
 * Provides common functionality for all services
 */
import { api, type RequestConfig } from '../config';
import { BaseEntity, PaginatedResponse, BaseListParams } from '@superapp/shared-types';

export abstract class BaseService<T extends BaseEntity> {
  protected abstract get endpoint(): string;

  /**
   * Get paginated list of items
   */
  async getPage(params?: BaseListParams & Record<string, unknown>, config?: RequestConfig): Promise<PaginatedResponse<T>> {
    // Convert params to URLSearchParams
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
          searchParams.append(key, stringValue);
        }
      });
    }

    const queryString = searchParams.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
    
    return api.get<PaginatedResponse<T>>(url, config);
  }

  /**
   * Get item by ID
   */
  async getById(id: string, config?: RequestConfig): Promise<T> {
    return api.get<T>(`${this.endpoint}/${id}`, config);
  }

  /**
   * Create new item
   */
  async create(data: Partial<T>, config?: RequestConfig): Promise<T> {
    return api.post<T>(this.endpoint, data, config);
  }

  /**
   * Update item
   */
  async update(id: string, data: Partial<T>, config?: RequestConfig): Promise<T> {
    return api.put<T>(`${this.endpoint}/${id}`, data, config);
  }

  /**
   * Delete item
   */
  async delete(id: string, config?: RequestConfig): Promise<boolean | undefined> {
    await api.delete<boolean>(`${this.endpoint}/${id}`, config);
    return true;
  }

  /**
   * Restore (soft-deleted) item
   */
  async restore(id: string, config?: RequestConfig): Promise<boolean | undefined> {
    await api.post<boolean>(`${this.endpoint}/${id}/restore`, undefined, config);
    return true;
  }
}
