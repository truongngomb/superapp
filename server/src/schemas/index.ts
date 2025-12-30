/**
 * Schemas Module - Central Schema Exports
 * 
 * Re-exports all validation schemas from individual modules.
 * 
 * @example
 * ```typescript
 * import { CategoryCreateSchema, RoleSchemas, paginationSchema } from './schemas/index.js';
 * ```
 */

// Common schemas
export {
  idSchema,
  nonEmptyString,
  emailSchema,
  urlSchema,
  hexColorSchema,
  paginationSchema,
  sortSchema,
  listQuerySchema,
  idParamSchema,
  schemas,
} from './common.schema.js';
export type {
  PaginationQuery,
  SortQuery,
  ListQuery,
  IdParam,
} from './common.schema.js';

// Category schemas
export {
  CategoryCreateSchema,
  CategoryUpdateSchema,
  CategorySchemas,
} from './category.schema.js';
export type {
  CategoryCreateSchemaType,
  CategoryUpdateSchemaType,
} from './category.schema.js';

// Role schemas
export {
  RoleCreateSchema,
  RoleUpdateSchema,
  RoleSchemas,
} from './role.schema.js';
export type {
  RoleCreateSchemaType,
  RoleUpdateSchemaType,
} from './role.schema.js';

// User schemas
export {
  UserUpdateSchema,
  UserRoleAssignmentSchema,
} from './user.schema.js';
export type {
  UserUpdateSchemaType,
  UserRoleAssignmentSchemaType,
} from './user.schema.js';

