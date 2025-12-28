import { api } from '@/config/api';
import type { Category, CategoryInput } from '@/types';

export const categoryService = {
  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    return api.get<Category[]>('/categories');
  },

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<Category> {
    return api.get<Category>(`/categories/${id}`);
  },

  /**
   * Create new category
   */
  async create(data: CategoryInput): Promise<Category> {
    return api.post<Category>('/categories', data);
  },

  /**
   * Update category
   */
  async update(id: string, data: CategoryInput): Promise<Category> {
    return api.put<Category>(`/categories/${id}`, data);
  },

  /**
   * Delete category
   */
  async delete(id: string): Promise<void> {
    return api.delete(`/categories/${id}`);
  },
};
