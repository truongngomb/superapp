/**
 * Roles Collection
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { autodateField, jsonField, textField } from '../collection.schema.js';

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
    autodateField('created'),
    autodateField('updated'),
  ],

  indexes: [
    'CREATE UNIQUE INDEX `idx_YFklELIcJE` ON `roles` (`name`)',
  ],

  listRule: '@request.auth.role.name = "Admin"',
  viewRule: '@request.auth.id != ""',
  createRule: '@request.auth.role.name = "Admin"',
  updateRule: '@request.auth.role.name = "Admin"',
  deleteRule: '@request.auth.role.name = "Admin"',
};