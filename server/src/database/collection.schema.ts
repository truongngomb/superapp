/**
 * PocketBase Collection Schema Types
 * 
 * TypeScript definitions for programmatic collection management.
 * Used to define collections in code and sync with PocketBase.
 */

// =============================================================================
// Field Types
// =============================================================================

/**
 * PocketBase field types
 */
export type PBFieldType =
  | 'text'
  | 'number'
  | 'bool'
  | 'email'
  | 'url'
  | 'date'
  | 'select'
  | 'relation'
  | 'file'
  | 'json'
  | 'autodate'
  | 'editor'
  | 'password';

/**
 * Base field definition
 */
export interface BaseField {
  name: string;
  type: PBFieldType;
  required?: boolean;
  hidden?: boolean;
  presentable?: boolean;
  system?: boolean;
}

/**
 * Text field options
 */
export interface TextField extends BaseField {
  type: 'text';
  min?: number;
  max?: number;
  pattern?: string;
  autogeneratePattern?: string;
  primaryKey?: boolean;
}

/**
 * Number field options
 */
export interface NumberField extends BaseField {
  type: 'number';
  min?: number;
  max?: number;
  noDecimal?: boolean;
}

/**
 * Bool field options
 */
export interface BoolField extends BaseField {
  type: 'bool';
}

/**
 * Email field options
 */
export interface EmailField extends BaseField {
  type: 'email';
  exceptDomains?: string[];
  onlyDomains?: string[];
}

/**
 * URL field options
 */
export interface UrlField extends BaseField {
  type: 'url';
  exceptDomains?: string[];
  onlyDomains?: string[];
}

/**
 * Date field options
 */
export interface DateField extends BaseField {
  type: 'date';
  min?: string;
  max?: string;
}

/**
 * Select field options
 */
export interface SelectField extends BaseField {
  type: 'select';
  values: string[];
  maxSelect?: number;
}

/**
 * Relation field options
 */
export interface RelationField extends BaseField {
  type: 'relation';
  collectionId: string;
  cascadeDelete?: boolean;
  minSelect?: number;
  maxSelect?: number;
  displayFields?: string[];
}

/**
 * File field options
 */
export interface FileField extends BaseField {
  type: 'file';
  maxSelect?: number;
  maxSize?: number;
  mimeTypes?: string[];
  thumbs?: string[];
  protected?: boolean;
}

/**
 * JSON field options
 */
export interface JsonField extends BaseField {
  type: 'json';
  maxSize?: number;
}

/**
 * Autodate field options
 */
export interface AutodateField extends BaseField {
  type: 'autodate';
  onCreate?: boolean;
  onUpdate?: boolean;
}

/**
 * Editor field options
 */
export interface EditorField extends BaseField {
  type: 'editor';
  maxSize?: number;
  convertUrls?: boolean;
}

/**
 * Union of all field types
 */
export type CollectionField =
  | TextField
  | NumberField
  | BoolField
  | EmailField
  | UrlField
  | DateField
  | SelectField
  | RelationField
  | FileField
  | JsonField
  | AutodateField
  | EditorField;

// =============================================================================
// Collection Types
// =============================================================================

/**
 * Collection types
 */
export type CollectionType = 'base' | 'auth' | 'view';

/**
 * Base collection schema
 */
export interface BaseCollectionSchema {
  name: string;
  type: CollectionType;
  fields: CollectionField[];
  indexes?: string[];
  system?: boolean;
  
  // API Rules (null = superusers only, '' = public, expression = conditional)
  listRule?: string | null;
  viewRule?: string | null;
  createRule?: string | null;
  updateRule?: string | null;
  deleteRule?: string | null;
}

/**
 * Auth collection specific options
 */
export interface AuthCollectionSchema extends BaseCollectionSchema {
  type: 'auth';
  authRule?: string;
  manageRule?: string | null;
  
  // Password auth config
  passwordAuth?: {
    enabled: boolean;
    identityFields?: string[];
  };
  
  // OAuth2 config
  oauth2?: {
    enabled: boolean;
    mappedFields?: {
      id?: string;
      name?: string;
      username?: string;
      avatarURL?: string;
    };
  };
  
  // MFA config
  mfa?: {
    enabled: boolean;
    duration?: number;
    rule?: string;
  };
  
  // Token durations
  authToken?: { duration: number };
  passwordResetToken?: { duration: number };
  emailChangeToken?: { duration: number };
  verificationToken?: { duration: number };
  fileToken?: { duration: number };
}

/**
 * View collection specific options
 */
export interface ViewCollectionSchema extends BaseCollectionSchema {
  type: 'view';
  viewQuery: string;
}

/**
 * Union of all collection schema types
 */
export type CollectionSchema = 
  | BaseCollectionSchema 
  | AuthCollectionSchema 
  | ViewCollectionSchema;

// =============================================================================
// Migration Types
// =============================================================================

/**
 * Migration action type
 */
export type MigrationAction = 'create' | 'update' | 'delete' | 'skip';

/**
 * Field diff result
 */
export interface FieldDiff {
  name: string;
  action: MigrationAction;
  before?: CollectionField;
  after?: CollectionField;
}

/**
 * Collection diff result
 */
export interface CollectionDiff {
  name: string;
  action: MigrationAction;
  fieldDiffs?: FieldDiff[];
  ruleDiffs?: string[];
}

/**
 * Migration diff result
 */
export interface MigrationDiff {
  collections: CollectionDiff[];
  hasChanges: boolean;
  summary: string;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  applied: string[];
  failed: Array<{ collection: string; error: string }>;
  duration: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Create a text field definition
 */
export function textField(name: string, options?: Partial<Omit<TextField, 'name' | 'type'>>): TextField {
  return { name, type: 'text', ...options };
}

/**
 * Create a number field definition
 */
export function numberField(name: string, options?: Partial<Omit<NumberField, 'name' | 'type'>>): NumberField {
  return { name, type: 'number', ...options };
}

/**
 * Create a bool field definition
 */
export function boolField(name: string, options?: Partial<Omit<BoolField, 'name' | 'type'>>): BoolField {
  return { name, type: 'bool', ...options };
}

/**
 * Create a JSON field definition
 */
export function jsonField(name: string, options?: Partial<Omit<JsonField, 'name' | 'type'>>): JsonField {
  return { name, type: 'json', ...options };
}

/**
 * Create a relation field definition
 */
export function relationField(
  name: string, 
  collection: string | { name: string }, 
  options?: Partial<Omit<RelationField, 'name' | 'type' | 'collectionId'>>
): RelationField {
  const collectionId = typeof collection === 'string' ? collection : collection.name;
  return { name, type: 'relation', collectionId, ...options };
}

/**
 * Create a select field definition
 */
export function selectField(
  name: string, 
  values: string[], 
  options?: Partial<Omit<SelectField, 'name' | 'type' | 'values'>>
): SelectField {
  return { name, type: 'select', values, ...options };
}

/**
 * Create a file field definition
 */
export function fileField(name: string, options?: Partial<Omit<FileField, 'name' | 'type'>>): FileField {
  return { name, type: 'file', ...options };
}

/**
 * Create an autodate field definition
 */
export function autodateField(
  name: string, 
  options: { onCreate?: boolean; onUpdate?: boolean } = { onCreate: true, onUpdate: true }
): AutodateField {
  return { name, type: 'autodate', ...options };
}

/**
 * Create an email field definition
 */
export function emailField(name: string, options?: Partial<Omit<EmailField, 'name' | 'type'>>): EmailField {
  return { name, type: 'email', ...options };
}

/**
 * Create a URL field definition
 */
export function urlField(name: string, options?: Partial<Omit<UrlField, 'name' | 'type'>>): UrlField {
  return { name, type: 'url', ...options };
}

/**
 * Create a date field definition
 */
export function dateField(name: string, options?: Partial<Omit<DateField, 'name' | 'type'>>): DateField {
  return { name, type: 'date', ...options };
}

/**
 * Create an editor (rich text) field definition
 */
export function editorField(name: string, options?: Partial<Omit<EditorField, 'name' | 'type'>>): EditorField {
  return { name, type: 'editor', ...options };
}

// =============================================================================
// Index Helper Functions
// =============================================================================

/**
 * Create a unique index on a single column
 * @example uniqueIndex('users', 'email') // CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`)
 */
export function uniqueIndex(table: string, column: string): string {
  return `CREATE UNIQUE INDEX \`idx_${table}_${column}\` ON \`${table}\` (\`${column}\`)`;
}

/**
 * Create a unique index with a WHERE condition
 * @example uniqueIndexWhere('users', 'email', "email != ''")
 */
export function uniqueIndexWhere(table: string, column: string, where: string): string {
  return `CREATE UNIQUE INDEX \`idx_${table}_${column}\` ON \`${table}\` (\`${column}\`) WHERE ${where}`;
}

/**
 * Create a regular (non-unique) index on a single column
 * @example index('posts', 'author_id')
 */
export function index(table: string, column: string): string {
  return `CREATE INDEX \`idx_${table}_${column}\` ON \`${table}\` (\`${column}\`)`;
}

/**
 * Create an index on multiple columns
 * @example compositeIndex('posts', ['author_id', 'created'])
 */
export function compositeIndex(table: string, columns: string[]): string {
  const name = columns.join('_');
  const cols = columns.map(c => `\`${c}\``).join(', ');
  return `CREATE INDEX \`idx_${table}_${name}\` ON \`${table}\` (${cols})`;
}

/**
 * Create a unique composite index on multiple columns
 * @example uniqueCompositeIndex('user_roles', ['user_id', 'role_id'])
 */
export function uniqueCompositeIndex(table: string, columns: string[]): string {
  const name = columns.join('_');
  const cols = columns.map(c => `\`${c}\``).join(', ');
  return `CREATE UNIQUE INDEX \`idx_${table}_${name}\` ON \`${table}\` (${cols})`;
}

