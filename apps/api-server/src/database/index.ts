/**
 * Database Module - Central Exports
 * 
 * Exports collection schemas, migration service, and utilities.
 */

// Schema types and helpers
export type {
  PBFieldType,
  CollectionField,
  TextField,
  NumberField,
  BoolField,
  EmailField,
  UrlField,
  DateField,
  SelectField,
  RelationField,
  FileField,
  JsonField,
  AutodateField,
  EditorField,
  CollectionType,
  BaseCollectionSchema,
  AuthCollectionSchema,
  ViewCollectionSchema,
  CollectionSchema,
  MigrationAction,
  FieldDiff,
  CollectionDiff,
  MigrationDiff,
  MigrationResult,
} from './collection.schema.js';

export {
  textField,
  numberField,
  boolField,
  jsonField,
  relationField,
  selectField,
  fileField,
  autodateField,
  emailField,
  urlField,
  dateField,
  editorField,
} from './collection.schema.js';

// Collection definitions
export {
  usersCollection,
  categoriesCollection,
  rolesCollection,
  allCollections,
  CollectionNames,
  type CollectionName,
} from './collections/index.js';

// Migration service
export { MigrationService } from './migration.service.js';
