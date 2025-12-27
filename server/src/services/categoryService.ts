import { pb, Collections, cache, getOrSet, invalidateByPattern } from '../config/index.js';
import type { Category, CategoryInput } from '../types/index.js';
import { NotFoundError } from '../middleware/index.js';

const CACHE_KEY = 'categories';

/**
 * In-memory fallback data when PocketBase is not available
 */
let fallbackCategories: Category[] = [
  {
    id: '1',
    name: 'Công nghệ',
    description: 'Các sản phẩm công nghệ',
    color: '#3b82f6',
    icon: 'folder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Thời trang',
    description: 'Quần áo và phụ kiện',
    color: '#ec4899',
    icon: 'folder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Thực phẩm',
    description: 'Đồ ăn và thức uống',
    color: '#22c55e',
    icon: 'folder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Check if PocketBase is available
 */
async function isPocketBaseAvailable(): Promise<boolean> {
  try {
    await pb.health.check();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  return getOrSet(CACHE_KEY, async () => {
    const pbAvailable = await isPocketBaseAvailable();
    
    if (pbAvailable) {
      try {
        const records = await pb.collection(Collections.CATEGORIES).getFullList();
        return records.map((r: Record<string, unknown>) => ({
          id: r['id'] as string,
          name: r['name'] as string,
          description: r['description'] as string,
          color: r['color'] as string,
          icon: r['icon'] as string,
          createdAt: r['created'] as string,
          updatedAt: r['updated'] as string,
        }));
      } catch (error) {
        console.error('[CategoryService] PocketBase error:', error);
      }
    }

    // Return fallback data
    return fallbackCategories;
  }, 300); // Cache for 5 minutes
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category> {
  const categories = await getAllCategories();
  const category = categories.find((c) => c.id === id);
  
  if (!category) {
    throw new NotFoundError(`Category with id ${id} not found`);
  }
  
  return category;
}

/**
 * Create a new category
 */
export async function createCategory(input: CategoryInput): Promise<Category> {
  const pbAvailable = await isPocketBaseAvailable();
  
  if (pbAvailable) {
    try {
      const record = await pb.collection(Collections.CATEGORIES).create(input);
      invalidateByPattern(CACHE_KEY);
      return {
        id: record['id'] as string,
        name: record['name'] as string,
        description: record['description'] as string,
        color: record['color'] as string,
        icon: record['icon'] as string,
        createdAt: record['created'] as string,
        updatedAt: record['updated'] as string,
      };
    } catch (error) {
      console.error('[CategoryService] PocketBase error:', error);
    }
  }

  // Fallback: add to in-memory array
  const newCategory: Category = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  fallbackCategories.push(newCategory);
  cache.del(CACHE_KEY);
  return newCategory;
}

/**
 * Update a category
 */
export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  const pbAvailable = await isPocketBaseAvailable();
  
  if (pbAvailable) {
    try {
      const record = await pb.collection(Collections.CATEGORIES).update(id, input);
      invalidateByPattern(CACHE_KEY);
      return {
        id: record['id'] as string,
        name: record['name'] as string,
        description: record['description'] as string,
        color: record['color'] as string,
        icon: record['icon'] as string,
        createdAt: record['created'] as string,
        updatedAt: record['updated'] as string,
      };
    } catch (error) {
      console.error('[CategoryService] PocketBase error:', error);
    }
  }

  // Fallback: update in-memory array
  const index = fallbackCategories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new NotFoundError(`Category with id ${id} not found`);
  }

  const existingCategory = fallbackCategories[index];
  if (!existingCategory) {
    throw new NotFoundError(`Category with id ${id} not found`);
  }

  const updatedCategory: Category = {
    ...existingCategory,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  fallbackCategories[index] = updatedCategory;
  cache.del(CACHE_KEY);
  return updatedCategory;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  const pbAvailable = await isPocketBaseAvailable();
  
  if (pbAvailable) {
    try {
      await pb.collection(Collections.CATEGORIES).delete(id);
      invalidateByPattern(CACHE_KEY);
      return;
    } catch (error) {
      console.error('[CategoryService] PocketBase error:', error);
    }
  }

  // Fallback: remove from in-memory array
  const index = fallbackCategories.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new NotFoundError(`Category with id ${id} not found`);
  }

  fallbackCategories = fallbackCategories.filter((c) => c.id !== id);
  cache.del(CACHE_KEY);
}
