
import { CollectionSchema, dateField, numberField, jsonField } from '../collection.schema.js';

export const systemMetricsSnapshotsCollection: CollectionSchema = {
  name: 'system_metrics_snapshots',
  type: 'base',
  system: false,
  fields: [
    dateField('timestamp', { required: true, presentable: true }),
    numberField('total_requests', { required: true, presentable: false }),
    numberField('avg_latency', { required: true, presentable: false }),
    numberField('error_count', { required: true, presentable: false }),
    numberField('p95_latency', { required: false, presentable: false }),
    jsonField('top_endpoints', { required: false, presentable: false }),
  ],
  indexes: [
    // Index by timestamp for efficient time-range queries
    'CREATE INDEX idx_snapshot_timestamp ON system_metrics_snapshots (timestamp)',
  ],
  listRule: null, // Admin only
  viewRule: null, // Admin only
  createRule: null, // Admin only
  updateRule: null, // Admin only
  deleteRule: null, // Admin only
};
