import {
  BaseCollectionSchema,
  relationField,
  numberField,
  textField,
  urlField,
  jsonField,
  boolField,
  autodateField,
  index
} from '../collection.schema.js';

export const swVideoScenesCollection: BaseCollectionSchema = {
  name: 'sw_video_scenes',
  type: 'base',
  fields: [
    relationField('project_id', 'sw_video_projects', { required: true, cascadeDelete: true, maxSelect: 1 }),
    numberField('order', { required: true }),
    textField('script_text'),
    textField('visual_prompt'),
    urlField('image_url'),
    urlField('audio_url'),
    urlField('video_url'),
    numberField('duration'),
    jsonField('metadata'),
    boolField('isDeleted'),
    autodateField('created', { onCreate: true, onUpdate: false }),
    autodateField('updated', { onCreate: true, onUpdate: true }),
  ],
  indexes: [
    index('sw_video_scenes', 'project_id'),
  ],
  listRule: '@request.auth.id != ""',
  viewRule: '@request.auth.id != ""',
  createRule: '@request.auth.id != ""',
  updateRule: '@request.auth.id != ""',
  deleteRule: '@request.auth.id != ""',
};
