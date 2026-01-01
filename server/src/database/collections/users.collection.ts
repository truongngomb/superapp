/**
 * Users Collection
 */
import type { AuthCollectionSchema } from '../collection.schema.js';
import { autodateField, boolField, fileField, relationField, textField } from '../collection.schema.js';

/**
 * Users collection
 */
export const usersCollection: AuthCollectionSchema = {
  name: 'users',
  type: 'auth',

  fields: [
    textField('name', { min: 0, max: 255 }),
    fileField('avatar', { maxSelect: 1 }),
    relationField('role', 'roles', { maxSelect: 1 }),
    boolField('isActive'),
    autodateField('created'),
    autodateField('updated'),
  ],

  indexes: [
    'CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)',
    'CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != \'\'',
  ],

  listRule: 'id = @request.auth.id || @request.auth.role.name = "Admin"',
  viewRule: 'id = @request.auth.id || @request.auth.role.name = "Admin"',
  createRule: '@request.auth.role.name = "Admin"',
  updateRule: 'id = @request.auth.id || @request.auth.role.name = "Admin"',
  deleteRule: 'id = @request.auth.id || @request.auth.role.name = "Admin"',

  passwordAuth: {
    enabled: true,
    identityFields: ['email'],
  },

  oauth2: { enabled: true },
};