/**
 * Markdown Pages Types & Schemas
 */
import { z } from 'zod';

const BaseResourceSchema = z.object({
  id: z.string(),
  created: z.string(),
  updated: z.string(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.string().optional().nullable(),
});

// ============================================================================
// Schemas
// ============================================================================

export const MarkdownPageSchema = BaseResourceSchema.extend({
  title: z.string().min(1).max(200),
  menuTitle: z.string().max(50).optional(),
  isTitle: z.boolean().default(false),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  content: z.string(),
  excerpt: z.string().max(500).optional(),
  icon: z.string().optional(),
  coverImage: z.string().optional(),
  showInMenu: z.boolean().default(false),
  parentId: z.string().optional(),
  order: z.number().default(0),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().optional(),
});

export const MarkdownPageCreateSchema = MarkdownPageSchema.omit({
  id: true,
  created: true,
  updated: true,
  deletedAt: true, // remove if not in schema
}); // Zod omit logic needs accurate keys. BaseResourceSchema has deletedAt.

export const MarkdownPageUpdateSchema = MarkdownPageCreateSchema.partial();

// Batch Operations
export const BatchDeleteSchema = z.object({
  ids: z.array(z.string()),
});

export const BatchRestoreSchema = z.object({
  ids: z.array(z.string()),
});

export const BatchUpdateStatusSchema = z.object({
  ids: z.array(z.string()),
  isActive: z.boolean(),
});

// ============================================================================
// Types
// ============================================================================

export type MarkdownPage = z.infer<typeof MarkdownPageSchema>;
export type MarkdownPageCreateInput = z.infer<typeof MarkdownPageCreateSchema>;
export type MarkdownPageUpdateInput = z.infer<typeof MarkdownPageUpdateSchema>;

// Menu Tree Item
export interface MarkdownMenuItem {
  id: string;
  title: string;
  menuTitle?: string;
  isTitle?: boolean;
  slug: string;
  icon?: string;
  order: number;
  children?: MarkdownMenuItem[];
}

// List Params
export interface MarkdownPageListParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  isPublished?: boolean;
  showInMenu?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
}

// Paginated Response
export interface PaginatedMarkdownPages {
  items: MarkdownPage[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
