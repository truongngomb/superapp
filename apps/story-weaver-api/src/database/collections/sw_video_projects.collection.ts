import {
  BaseCollectionSchema,
  textField,
  selectField,
  jsonField,
  relationField,
  boolField,
  autodateField,
  index
} from '../collection.schema.js';

export const swVideoProjectsCollection: BaseCollectionSchema = {
  name: 'sw_video_projects',
  type: 'base',
  fields: [
    textField('name', { required: true }),
    textField('description'),
    selectField('status', ['draft', 'generating', 'rendering', 'completed', 'error'], { required: true, maxSelect: 1 }),
    jsonField('settings'),
    relationField('user_id', 'users', { required: true, cascadeDelete: false, maxSelect: 1, displayFields: ['id', 'email'] }),
    boolField('isActive'), 
    boolField('isDeleted'),
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],
  indexes: [
    index('sw_video_projects', 'user_id'),
    index('sw_video_projects', 'status'),
  ],
  listRule: '@request.auth.id != "" && (isDeleted = false || user_id = @request.auth.id)',
  viewRule: '@request.auth.id != "" && (isDeleted = false || user_id = @request.auth.id)',
  createRule: '@request.auth.id != ""',
  updateRule: 'user_id = @request.auth.id',
  deleteRule: 'user_id = @request.auth.id',
};
