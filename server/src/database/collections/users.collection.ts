/**
 * Users Collection
 */
import type { AuthCollectionSchema } from '../collection.schema.js';
import { autodateField, fileField, relationField, textField } from '../collection.schema.js';

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
    autodateField('created'),
    autodateField('updated'),
  ],

  indexes: [
    'CREATE UNIQUE INDEX `idx_tokenKey__pb_users_auth_` ON `users` (`tokenKey`)',
    'CREATE UNIQUE INDEX `idx_email__pb_users_auth_` ON `users` (`email`) WHERE `email` != \'\'',
  ],

  listRule: 'id = @request.auth.id',
  viewRule: 'id = @request.auth.id',
  createRule: '',
  updateRule: 'id = @request.auth.id',
  deleteRule: 'id = @request.auth.id',

  passwordAuth: {
    enabled: true,
    identityFields: ['email'],
  },

  oauth2: { enabled: true },
};