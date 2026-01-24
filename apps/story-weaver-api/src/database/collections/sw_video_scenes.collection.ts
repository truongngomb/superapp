import type { CollectionSchema } from '../collection.schema.js';

export const swVideoScenesCollection: CollectionSchema = {
  name: 'sw_video_scenes',
  type: 'base',
  schema: [
    { name: 'project_id', type: 'relation', required: true, options: {
      collectionId: 'sw_video_projects',
      cascadeDelete: true,
      maxSelect: 1,
    }},
    { name: 'order', type: 'number', required: true },
    { name: 'script_text', type: 'text' },
    { name: 'visual_prompt', type: 'text' },
    { name: 'image_url', type: 'url' },
    { name: 'audio_url', type: 'url' },
    { name: 'video_url', type: 'url' },
    { name: 'duration', type: 'number', default: 5 },
    { name: 'metadata', type: 'json' },
    { name: 'isDeleted', type: 'bool', default: false },
  ],
  indexes: [
    'CREATE INDEX `idx_sw_scene_project` ON `sw_video_scenes` (`project_id`)',
  ],
  listRule: '@request.auth.id != ""',
  viewRule: '@request.auth.id != ""',
  createRule: '@request.auth.id != ""',
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
};
