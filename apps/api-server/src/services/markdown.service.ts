/**
 * Markdown Pages Service
 * Handles all markdown page-related business logic
 */
import { BaseService } from './base.service.js';
import type { 
  MarkdownPage, 
  MarkdownMenuItem
} from '@superapp/shared-types';

export class MarkdownService extends BaseService<MarkdownPage> {
  protected readonly collectionName = 'markdown_pages';
  protected readonly cacheKey = 'markdown:pages';

  protected mapRecord(record: Record<string, unknown>): MarkdownPage {
    return {
      id: record['id'] as string,
      created: record['created'] as string,
      updated: record['updated'] as string,
      isDeleted: Boolean(record['isDeleted']),
      deletedAt: record['deletedAt'] ? (record['deletedAt'] as string) : null,
      title: (record['title'] as string) || '',
      menuTitle: record['menuTitle'] ? (record['menuTitle'] as string) : undefined,
      isTitle: Boolean(record['isTitle']),
      slug: (record['slug'] as string) || '',
      content: (record['content'] as string) || '',
      excerpt: record['excerpt'] ? (record['excerpt'] as string) : undefined,
      icon: record['icon'] ? (record['icon'] as string) : undefined,
      coverImage: record['coverImage'] ? (record['coverImage'] as string) : undefined,
      showInMenu: Boolean(record['showInMenu']),
      parentId: record['parentId'] ? (record['parentId'] as string) : undefined,
      order: Number(record['order'] || 0),
      isPublished: Boolean(record['isPublished']),
      publishedAt: record['publishedAt'] ? (record['publishedAt'] as string) : undefined,
    } as MarkdownPage;
  }

  /**
   * Get page by slug (for public viewing)
   * Only returns published and non-deleted pages
   */
  async getBySlug(slug: string): Promise<MarkdownPage | null> {
    try {
      const result = await this.collection.getFirstListItem<MarkdownPage>(
        `slug = "${slug}" && isPublished = true && isDeleted = false`
      );
      return this.mapRecord(result as unknown as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  /**
   * Get menu tree
   * Returns hierarchical structure of menu items
   */
  async getMenuTree(): Promise<MarkdownMenuItem[]> {
    const pages = await this.collection.getFullList<MarkdownPage>({
      filter: `showInMenu = true && isPublished = true && isDeleted = false`,
      sort: 'order',
    });
    
    return this.buildMenuTree(pages.map(r => this.mapRecord(r as unknown as Record<string, unknown>)));
  }

  /**
   * Build hierarchical menu tree (max 2 levels)
   * @private
   */
  private buildMenuTree(pages: MarkdownPage[]): MarkdownMenuItem[] {
    const tree: MarkdownMenuItem[] = [];
    const lookup = new Map<string, MarkdownMenuItem>();
    
    // First pass: create lookup map
    pages.forEach(page => {
      lookup.set(page.id, {
        id: page.id,
        title: page.title,
        menuTitle: page.menuTitle,
        isTitle: page.isTitle,
        slug: page.slug,
        icon: page.icon,
        order: page.order,
        children: [],
      });
    });
    
    // Second pass: build tree
    pages.forEach(page => {
      const item = lookup.get(page.id);
      if (!item) return;

      if (!page.parentId) {
        tree.push(item); // Root level
      } else {
        const parent = lookup.get(page.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(item);
        }
      }
    });
    
    return tree;
  }

  /**
   * Validate menu hierarchy depth (max 2 levels)
   * Throws error if validation fails
   */
  async validateMenuDepth(parentId: string | undefined): Promise<boolean> {
    if (!parentId) return true; // Root level is always valid
    
    // Check if parent exists
    try {
      const parent = await this.getById(parentId);
      
      // Check if parent is already a child (would create level 3)
      if (parent.parentId) {
        throw new Error('Maximum menu depth is 2 levels. Cannot add child to a child page.');
      }
      
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new Error('Parent page not found');
      }
      throw error;
    }
  }

  /**
   * Validate slug uniqueness (before create/update)
   * @param slug Slug to validate
   * @param excludeId ID to exclude from check (for updates)
   */
  async validateSlug(slug: string, excludeId?: string): Promise<boolean> {
    const filter = excludeId 
      ? `slug = "${slug}" && id != "${excludeId}"`
      : `slug = "${slug}"`;
    
    const existing = await this.collection.getList(1, 1, { filter });
    return existing.totalItems === 0;
  }

  /**
   * Check for protected/reserved slugs
   * These slugs are reserved by the system and cannot be used
   */
  isReservedSlug(slug: string): boolean {
    const RESERVED = [
      'admin',
      'auth',
      'api',
      'settings',
      'users',
      'roles',
      'categories',
      'markdown-pages',
      'login',
      'register',
      'logout',
      'profile',
      'dashboard',
      'home'
    ];
    
    return (
      RESERVED.includes(slug) ||
      slug.startsWith('admin/') ||
      slug.startsWith('api/') ||
      slug.startsWith('auth/')
    );
  }
}

export const markdownService = new MarkdownService();
