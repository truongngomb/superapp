/**
 * Collection Schema Interface
 */
export interface CollectionSchema {
  name: string;
  type: 'base' | 'auth' | 'view';
  schema: Array<{
    name: string;
    type: 'text' | 'number' | 'bool' | 'email' | 'url' | 'date' | 'select' | 'json' | 'file' | 'relation';
    required?: boolean;
    presentable?: boolean;
    unique?: boolean;
    options?: Record<string, unknown>;
    default?: unknown;
  }>;
  indexes?: string[];
  listRule?: string | null;
  viewRule?: string | null;
  createRule?: string | null;
  updateRule?: string | null;
  deleteRule?: string | null;
  options?: Record<string, unknown>;
}
