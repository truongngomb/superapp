import { BaseEntity } from './common.js';

/**
 * System Metric Snapshot Interface
 * Represents a point-in-time snapshot of system traffic metrics.
 */
export interface SystemMetricSnapshot extends BaseEntity {
  timestamp: string; // ISO DateTime
  total_requests: number;
  avg_latency: number;
  error_count: number;
  p95_latency: number;
  top_endpoints: Array<{
    path: string;
    count: number;
    avgDuration: number;
  }>;
}
