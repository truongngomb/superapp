/**
 * Categories Collection
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { autodateField, boolField, textField } from '../collection.schema.js';

/**
 * Categories collection
 */
export const categoriesCollection: BaseCollectionSchema = {
  name: 'categories',
  type: 'base',

  fields: [
    textField('name', { min: 0, max: 0 }),
    textField('description', { min: 0, max: 0 }),
    textField('color', { min: 0, max: 0 }),
    textField('icon', { min: 0, max: 0 }),
    boolField('isActive'),
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],

  indexes: [
    'CREATE UNIQUE INDEX `idx_categories_name` ON `categories` (`name`)',
  ],

  listRule: '',
  viewRule: '@request.auth.id != ""',
  createRule: '@request.auth.id != ""',
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
};