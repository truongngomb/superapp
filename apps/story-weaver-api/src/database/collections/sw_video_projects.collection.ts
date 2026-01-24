import type { CollectionSchema } from '../collection.schema.js';

export const swVideoProjectsCollection: CollectionSchema = {
  name: 'sw_video_projects',
  type: 'base',
  schema: [
    { name: 'name', type: 'text', required: true },
    { name: 'description', type: 'text' },
    {
      name: 'status',
      type: 'select',
      options: {
        values: ['draft', 'generating', 'rendering', 'completed', 'error'],
        maxSelect: 1,
      },
      required: true,
    },
    { name: 'settings', type: 'json' },
    { name: 'user_id', type: 'relation', required: true, options: {
      collectionId: 'users',
      cascadeDelete: false,
      maxSelect: 1,
      displayFields: ['id', 'email']
    }},
    { name: 'isActive', type: 'bool', default: true },
    { name: 'isDeleted', type: 'bool', default: false },
  ],
  indexes: [
    'CREATE INDEX `idx_sw_project_user` ON `sw_video_projects` (`user_id`)',
    'CREATE INDEX `idx_sw_project_status` ON `sw_video_projects` (`status`)'
  ],
  listRule: '@request.auth.id != "" && (isDeleted = false || user_id = @request.auth.id)',
  viewRule: '@request.auth.id != "" && (isDeleted = false || user_id = @request.auth.id)',
  createRule: '@request.auth.id != ""',
  updateRule: 'user_id = @request.auth.id',
  deleteRule: 'user_id = @request.auth.id',
};
