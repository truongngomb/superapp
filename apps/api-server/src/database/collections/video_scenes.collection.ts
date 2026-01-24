/**
 * Video Scenes Collection
 */
import type { BaseCollectionSchema } from '../collection.schema.js';
import { autodateField, numberField, relationField, textField, fileField, boolField } from '../collection.schema.js';

export const videoScenesCollection: BaseCollectionSchema = {
  name: 'video_scenes',
  type: 'base',
  fields: [
    relationField('project_id', 'video_projects', { required: true, cascadeDelete: true, maxSelect: 1 }),
    numberField('order', { required: true }),
    textField('script_text'),
    textField('visual_prompt'),
    fileField('image_url', { maxSelect: 1, mimeTypes: ['image/*'] }),
    fileField('audio_url', { maxSelect: 1, mimeTypes: ['audio/*'] }),
    numberField('duration'),
    textField('transition'),
    boolField('isActive'),
    boolField('isDeleted'),
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],
  indexes: [
    'CREATE INDEX `idx_video_scenes_project_id` ON `video_scenes` (`project_id`)',
  ],
  listRule: null,
  viewRule: null,
  createRule: null,
  updateRule: null,
  deleteRule: null,
};
