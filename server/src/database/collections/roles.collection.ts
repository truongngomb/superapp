/**
 * Roles Collection
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { autodateField, boolField, jsonField, textField } from '../collection.schema.js';

/**
 * Roles collection
 */
export const rolesCollection: BaseCollectionSchema = {
  name: 'roles',
  type: 'base',

  fields: [
    textField('name', { min: 0, max: 0 }),
    textField('description', { min: 0, max: 0 }),
    jsonField('permissions'),
    boolField('isActive'),
    boolField('isDeleted'),
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],

  indexes: [
    'CREATE UNIQUE INDEX `idx_YFklELIcJE` ON `roles` (`name`)',
  ],

  listRule: null,
  viewRule: null,
  createRule: null,
  updateRule: null,
  deleteRule: null,
};