import { BaseService } from './baseService.js';
import { Collections } from '../config/index.js';
import type { Category, CategoryInput } from '../types/index.js';

class CategoryService extends BaseService<Category> {
  protected collectionName = Collections.CATEGORIES;
  protected cacheKey = 'categories';

  protected mapRecord(record: Record<string, unknown>): Category {
    return {
      id: record['id'] as string,
      name: record['name'] as string,
      description: record['description'] as string,
      color: record['color'] as string,
      icon: record['icon'] as string,
      createdAt: record['created'] as string,
      updatedAt: record['updated'] as string,
    };
  }

  protected getFallbackData(): Category[] {
    return [];
  }

  // Public aliases to match previous API if needed, or simply use instance methods
  async getAllCategories() { return this.getAll(); }
  async getCategoryById(id: string) { return this.getById(id); }
  async createCategory(input: CategoryInput) { return this.create(input); }
  async updateCategory(id: string, input: CategoryInput) { return this.update(id, input); }
  async deleteCategory(id: string) { return this.delete(id); }
}

export const categoryService = new CategoryService();
export const getAllCategories = categoryService.getAllCategories.bind(categoryService);
export const getCategoryById = categoryService.getCategoryById.bind(categoryService);
export const createCategory = categoryService.createCategory.bind(categoryService);
export const updateCategory = categoryService.updateCategory.bind(categoryService);
export const deleteCategory = categoryService.deleteCategory.bind(categoryService);
